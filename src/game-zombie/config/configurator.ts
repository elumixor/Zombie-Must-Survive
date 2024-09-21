import { getLocalStorage } from "@core";
import { EventEmitter, nonNull, nonNullAssert } from "@elumixor/frontils";
import { createElement, createView } from "./create-element";
import { Toggle } from "./toggle";
import "./styles/configurator.scss";
import type { Handle } from "./handles";
import { transformText } from "./transform-text";

export class Configurator {
    readonly reloadRequested = new EventEmitter<string | undefined>();

    private readonly localStorage = nonNull(getLocalStorage());

    private readonly container = createElement("div", { className: "configurator" });
    private readonly topHeader = createElement("div", { className: "c-header", parent: this.container });

    private readonly resetButton = createElement("div", {
        className: "c-button",
        parent: this.topHeader,
        textContent: "reset all",
    });
    private readonly exportButton = createElement("div", {
        className: "c-button",
        parent: this.topHeader,
        textContent: "export",
    });
    private readonly closeButton = createElement("div", {
        className: "c-button",
        parent: this.topHeader,
        textContent: "x",
    });

    private readonly content = new Toggle("Content", { open: true, header: false });
    private readonly dragger = createElement("div", { className: "c-dragger", parent: this.container });

    private readonly handles = new Map<string, Handle>();

    // Add the button to show/hide the configurator
    private readonly showButton = createElement("div", {
        className: "c-button show-button",
        parent: document.body,
        textContent: "show configurator (c)",
    });

    constructor() {
        document.body.prepend(this.container);

        this.container.appendChild(this.content.container);
        this.content.container.classList.add("configurator-content");

        // Show itself on the "R/r" key press
        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyC") this.visible = !this.visible;
        });

        this.exportButton.addEventListener("click", () => this.export());
        this.resetButton.addEventListener("click", () => this.reloadRequested.emit(undefined));
        this.showButton.addEventListener("click", () => (this.visible = true));
        this.closeButton.addEventListener("click", () => (this.visible = false));

        this.visible = true;

        // Add the resize functionality for the dragger
        let isDragging = false;
        let offsetX = 0;
        let initialWidth = 0;

        this.dragger.addEventListener("mousedown", (e) => {
            isDragging = true;

            offsetX = e.clientX;
            initialWidth = this.container.offsetWidth;
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            const width = initialWidth + e.clientX - offsetX;
            this.container.style.maxWidth = `${width}px`;
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }

    protected get visible() {
        return this.container.style.display !== "none";
    }
    protected set visible(value: boolean) {
        this.showButton.style.display = value ? "none" : "block";
        this.container.style.display = value ? "flex" : "none";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addHandle(handle: Handle<any>, propertyName: string, name?: string, section?: string) {
        let tab = "general";
        let group = "general" as string | undefined;

        if (name) [tab, group] = name.split(":");
        if (group === undefined) group = "general";

        tab = transformText(tab);
        group = transformText(group);

        const tabPath = `${tab}:${group}`;
        const id = `${tabPath}:${propertyName}`;
        const path = section ? `${section}:${tabPath}` : tabPath;

        const toggle = this.content.findOrCreate(path);
        const view = createView(propertyName, toggle.content);

        this.handles.set(id, handle);

        return { view, id };
    }

    load({ config }: { config: Record<string, unknown> }, id?: string) {
        // Recursively load the config
        const load = (data: Record<string, unknown>, path?: string) => {
            if (typeof data !== "object") {
                if (id !== undefined && path !== id) return;

                nonNullAssert(path);

                this.localStorage.setItem(path, data);
                this.handles.get(path)!.reset();
                return;
            }

            for (const key in data) {
                const value = data[key];
                load(value as Record<string, unknown>, path ? `${path}:${key}` : key);
            }
        };

        load(config);
    }

    resetSingle(id: string) {
        this.reloadRequested.emit(id);
    }

    private export() {
        const data = {} as Record<string, unknown>;
        for (const handle of this.handles.values()) {
            const [key, value] = handle.serialized;

            // Split the key by ":" and assign the value to the correct path
            const keys = key.split(":");
            const last = keys.pop()!;
            let current = data;
            for (const key of keys) {
                if (!current[key]) current[key] = {};
                current = current[key] as Record<string, unknown>;
            }

            current[last] = value;
        }

        const json = JSON.stringify({ config: data }, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = createElement("a", { parent: document.body });
        a.href = url;
        a.download = "config.json";
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
export const configurator = new Configurator();
