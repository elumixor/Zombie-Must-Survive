import { EventEmitter } from "@elumixor/frontils";
import { createElement, createView } from "../create-element";
import type { IHandleView } from "../imy-element";
import type { ArrayButtonContainer, IEditor, IEditorFactory } from "./editor";
import "./array.scss";
import { Toggle } from "../toggle";

export function arrayEditor<T>(
    view: IHandleView,
    elementEditorFactory: IEditorFactory<T>,
    options?: {
        title?: (index: number) => string;
        defaultValue?: T;
    },
): IEditor<T[]> {
    const toggle = new Toggle(view.title, { open: true });
    view.addChild(toggle);
    view.header.style.display = "none";

    const title = options?.title ?? ((index) => `Element ${index}`);

    view.container.classList.add("array-container");
    toggle.container.classList.add("w-full");
    toggle.header.classList.add("array-header");

    const elementsContainer = createElement("div", { parent: toggle.content });

    // Create the button to add new elements
    const addButton = createElement("button", { className: "c-button array-button", parent: toggle.header });
    addButton.innerText = "Add +";

    const headerTextNode = toggle.header.childNodes[0] as Text;

    // Create an event emitter
    const changed = new EventEmitter<T[]>();

    let currentEditors = new Array<IEditor<T>>();
    const currentValues = new Array<T>();

    // Function to add a new element editor
    const addElement = () => {
        const index = currentEditors.length;
        const elementView = createView(title(index), elementsContainer);
        const elementEditor = elementEditorFactory(elementView) as IEditor<T> & Partial<ArrayButtonContainer>;

        if (elementEditor.arrayButtonContainer) elementView.container.classList.add("special-array-handle-view");

        currentValues.push(options?.defaultValue ?? (null as T));
        if (options?.defaultValue) elementEditor.update(options.defaultValue);

        // Create the button to remove the element
        const removeButton = createElement("button", {
            className: "c-button array-button",
            parent: elementEditor.arrayButtonContainer ?? elementView.container,
        });
        removeButton.innerText = "-";

        // Add event listener to remove the element
        removeButton.addEventListener("click", () => {
            elementsContainer.removeChild(elementView.container);
            currentValues.removeAt(currentEditors.indexOf(elementEditor));
            currentEditors.remove(elementEditor);

            for (const editor of currentEditors) editor.view.header.textContent = title(currentEditors.indexOf(editor));

            emitChange();
        });

        // Listen for changes in the element editor
        elementEditor.changed.subscribe((value) => {
            const index = currentEditors.indexOf(elementEditor);
            currentValues[index] = value;
            emitChange();
        });

        return elementEditor;
    };

    // Function to emit changes
    const emitChange = () => {
        headerTextNode.textContent = view.title + ` (${currentEditors.length})`;
        changed.emit(currentValues);
    };

    // Add event listener to add new elements
    addButton.addEventListener("click", (e) => {
        e.stopPropagation();

        const editor = addElement();
        currentEditors.push(editor);
        emitChange();
    });

    const update = (values: T[]) => {
        currentEditors = [];

        while (elementsContainer.firstChild) elementsContainer.removeChild(elementsContainer.firstChild);

        for (const [index, value] of values.entries()) {
            const editor = addElement();
            editor.update(value);
            currentEditors.push(editor);
            currentValues[index] = value;
        }

        headerTextNode.textContent = view.title + ` (${currentEditors.length})`;
    };

    return { changed, update, view };
}
