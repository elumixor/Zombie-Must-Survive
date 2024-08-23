import { getLocalStorage } from "@core";
import { EventEmitter, nonNull } from "@elumixor/frontils";
import { createElement } from "./create-element";
import "./styles/configurator.scss";
import { Tab } from "./tab";

export class Configurator {
    readonly visibilityChanged = new EventEmitter<boolean>();
    readonly reloadRequested = new EventEmitter();

    private readonly localStorage = nonNull(getLocalStorage());

    private readonly container = createElement("div", { className: "configurator" });
    private readonly topHeader = createElement("div", { className: "c-header", parent: this.container });
    private readonly title = createElement("div", {
        className: "c-title secondary flex-grow",
        parent: this.topHeader,
        textContent: "Configurator",
    });

    private readonly refreshButton = createElement("div", {
        className: "action noround",
        parent: this.topHeader,
        textContent: "refresh",
    });
    private readonly exportButton = createElement("div", {
        className: "action noround",
        parent: this.topHeader,
        textContent: "export",
    });
    private readonly header = createElement("div", { className: "c-header", parent: this.container });
    private readonly closeButton = createElement("div", {
        className: "action noround",
        parent: this.topHeader,
        textContent: "X",
    });
    private readonly view = createElement("div", { className: "view", parent: this.container });

    private readonly tabs = new Map<string, Tab>();

    constructor() {
        // Show itself on the "R/r" key press
        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyC") this.visible = !this.visible;
        });

        this.closeButton.addEventListener("click", () => (this.visible = false));
        this.exportButton.addEventListener("click", () => this.export());
        this.refreshButton.addEventListener("click", () => this.reloadRequested.emit());
    }

    protected get visible() {
        return this.container.style.display !== "none";
    }
    protected set visible(value: boolean) {
        if (value === this.visible) return;

        this.container.style.display = value ? "block" : "none";
        this.visibilityChanged.emit(value);
    }

    getView(propertyName: string, name?: string) {
        let tab = "general";
        let group = "general" as string | undefined;

        if (name) [tab, group] = name.split(":");
        if (group === undefined) group = "general";

        tab = this.transformText(tab);
        group = this.transformText(group);

        const id = `${tab}:${group}:${propertyName}`;

        const tabElement = this.getTab(tab);
        const groupElement = tabElement.getGroup(group);
        const view = groupElement.createView(propertyName);

        return { view, id };
    }

    load({ config }: { config: Record<string, Record<string, Record<string, string>>> }) {
        for (const [tabName, tab] of Object.entries(config))
            for (const [groupName, group] of Object.entries(tab))
                for (const [propertyName, value] of Object.entries(group))
                    this.localStorage.setItem(`${tabName}:${groupName}:${propertyName}`, value);
    }

    private getTab(name: string) {
        const tab = this.tabs.get(name);
        if (tab) return tab;

        const tabElement = new Tab(name);
        this.tabs.set(name, tabElement);

        this.header.appendChild(tabElement.header);
        tabElement.selected.subscribe(() => this.selectTab(tabElement));

        return tabElement;
    }

    private selectTab(tab: Tab) {
        for (const t of this.tabs.values()) t.header.classList.toggle("selected", t === tab);

        const previous = this.view.firstChild;
        if (previous) this.view.removeChild(previous);

        this.view.appendChild(tab.container);
    }

    private export() {
        const data = Object.fromEntries(
            [...this.tabs.values()].map((tab) => [
                tab.name,
                Object.fromEntries(
                    [...tab.groups.values()].map((group) => [
                        group.name,
                        Object.fromEntries([...group.handles].map((handle) => handle.serialized)),
                    ]),
                ),
            ]),
        );

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
