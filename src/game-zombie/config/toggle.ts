import { createElement } from "./create-element";
import type { IMyElement, IToggleElement } from "./imy-element";
import "./styles/toggle.scss";
import { transformText } from "./transform-text";

export class Toggle implements IToggleElement {
    readonly container = createElement("div", { className: "toggle-container" });
    readonly header = createElement("div", { className: "toggle-header", parent: this.container });
    readonly content = createElement("div", { className: "toggle-content", parent: this.container });

    private readonly subElements = new Map<string, IMyElement>();

    constructor(
        readonly title: string,
        { open = false, header = true, parent = undefined as HTMLElement | undefined } = {},
    ) {
        this.header.textContent = title;
        this.open = open;
        if (!header) this.header.style.display = "none";
        if (parent) parent.appendChild(this.container);

        this.header.addEventListener("click", () => (this.open = !this.open));
    }

    get open() {
        return this.content.style.display === "block";
    }
    set open(value) {
        this.content.style.display = value ? "block" : "none";
        this.container.classList.toggle("open", value);
    }

    addChild(child: IMyElement, path?: string) {
        // Just add the child to the content if no path is provided
        if (path === undefined) {
            this.content.appendChild(child.container);
            this.subElements.set(child.title, child);
            return;
        }

        // Make nested toggles
        const toggle = this.makeNestedToggle(path);

        // Add child to the nested toggle
        toggle.addChild(child);
    }

    getChild(name: string) {
        return this.subElements.get(name);
    }

    find(name: string): IMyElement | undefined {
        const [firstId, ...rest] = name.split(":");
        const first = this.subElements.get(firstId);
        if (rest.isEmpty) return first;
        assert(first instanceof Toggle, "Expected first to be a Toggle");
        return first.find(rest.join(":"));
    }

    findOrCreate(name: string): IToggleElement {
        const [firstId, ...rest] = name.split(":");
        let current = this.subElements.get(firstId);
        if (rest.isEmpty) return (current ?? this.makeNestedToggle(name)) as IToggleElement;

        if (current === undefined) current = this.makeNestedToggle(firstId);

        assert(current instanceof Toggle, "Expected current to be a Toggle");
        return current.findOrCreate(rest.join(":"));
    }

    private makeNestedToggle(path: string): Toggle {
        const [first, ...rest] = path.split(":");
        let current = this.subElements.get(first);
        if (!current) {
            current = new Toggle(transformText(first));
            this.addChild(current);
        }

        assert(current instanceof Toggle, "Expected current to be a Toggle");

        let currentToggle = current;
        for (const name of rest) {
            let next = currentToggle.getChild(name);
            if (next === undefined) {
                next = new Toggle(name);
                currentToggle.addChild(next);
            }

            assert(next instanceof Toggle, "Expected next to be a Toggle");
            currentToggle = next;
        }

        return currentToggle;
    }
}
