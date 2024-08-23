import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "./create-element";
import { Group } from "./group";
import "./styles/tab.scss";

export class Tab {
    readonly selected = new EventEmitter();

    readonly header = createElement("div", { className: "tab-header noround" });
    readonly container = createElement("div", { className: "tab-content" });

    readonly groups = new Map<string, Group>();

    constructor(readonly name: string) {
        this.header.textContent = name;
        this.header.addEventListener("click", () => this.selected.emit());
    }

    getGroup(name: string) {
        const group = this.groups.get(name);
        if (group) return group;

        const groupElement = new Group(name);
        this.groups.set(name, groupElement);

        this.container.appendChild(groupElement.container);

        return groupElement;
    }
}
