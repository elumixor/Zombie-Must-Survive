import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IResetView } from "../imy-element";
import type { IEditor } from "./editor";
import { Handle } from "../handles";

export function buttonEditor(view: IResetView): IEditor<void> {
    view.header.style.display = "none";

    const button = createElement("button", {
        className: "editor button",
        parent: view.content,
        textContent: view.header.textContent!,
    });
    const changed = new EventEmitter();

    button.addEventListener("click", () => changed.emit());

    const update = () => undefined;

    return { changed, update, view, resetRequested: view.resetRequested };
}

export class ButtonHandle extends Handle<() => number, void> {
    override addToView(view: IResetView) {
        const { changed, resetRequested } = buttonEditor(view);

        const fn = this.propertyValue;

        changed.subscribe(() => {
            for (const instance of this.instances) fn.call(instance);
        });

        return { changed, resetRequested };
    }

    override updateView() {
        return;
    }
    override load() {
        return;
    }
    override save() {
        return;
    }
}
export const button = () => new ButtonHandle();
