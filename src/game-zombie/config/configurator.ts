import { getLocalStorage } from "@core";
import { EventEmitter, nonNull } from "@elumixor/frontils";
import { createElement, createView } from "./create-element";
import { Toggle } from "./toggle";
import "./styles/configurator.scss";

export class Configurator {
    readonly reloadRequested = new EventEmitter();

    private readonly localStorage = nonNull(getLocalStorage());

    private readonly container = createElement("div", { className: "configurator" });
    private readonly topHeader = createElement("div", { className: "c-header", parent: this.container });

    private readonly refreshButton = createElement("div", {
        className: "c-button",
        parent: this.topHeader,
        textContent: "reset",
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
        this.refreshButton.addEventListener("click", () => this.reloadRequested.emit());
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

    getView(propertyName: string, name?: string, section?: string) {
        let tab = "general";
        let group = "general" as string | undefined;

        if (name) [tab, group] = name.split(":");
        if (group === undefined) group = "general";

        tab = this.transformText(tab);
        group = this.transformText(group);

        const tabPath = `${tab}:${group}`;
        const id = `${tabPath}:${propertyName}`;
        const path = section ? `${section}:${tabPath}` : tabPath;

        const toggle = this.content.findOrCreate(path);
        const view = createView(propertyName, toggle.content);

        return { view, id };
    }

    load({ config }: { config: Record<string, Record<string, Record<string, string>>> }) {
        // for (const [tabName, tab] of Object.entries(config))
        //     for (const [groupName, group] of Object.entries(tab))
        //         for (const [propertyName, value] of Object.entries(group))
        //             this.localStorage.setItem(`${tabName}:${groupName}:${propertyName}`, value);
    }

    private export() {
        // const data = Object.fromEntries(
        //     [...this.tabs.values()].map((tab) => [
        //         tab.title,
        //         Object.fromEntries(
        //             [...tab.groups.values()].map((group) => [
        //                 group.name,
        //                 Object.fromEntries([...group.handles].map((handle) => handle.serialized)),
        //             ]),
        //         ),
        //     ]),
        // );
        // const json = JSON.stringify({ config: data }, null, 4);
        // const blob = new Blob([json], { type: "application/json" });
        // const url = URL.createObjectURL(blob);
        // const a = createElement("a", { parent: document.body });
        // a.href = url;
        // a.download = "config.json";
        // a.click();
        // URL.revokeObjectURL(url);
        // document.body.removeChild(a);
    }

    private transformText(text: string): string {
        // Split by camelCase and capitalize each word
        return text
            .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
            .split(" ")
            .map((word) => word.capitalize())
            .join(" ");
    }
}
export const configurator = new Configurator();
