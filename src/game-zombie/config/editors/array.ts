import { EventEmitter } from "@elumixor/frontils";
import { createElement, createView } from "../create-element";
import type { IHandleView } from "../handles";
import type { IEditor, IEditorFactory } from "./editor";
import "../styles/array.scss";

export function arrayEditor<T>(
    view: IHandleView,
    elementEditorFactory: IEditorFactory<T>,
    options?: {
        title?: (index: number) => string;
        defaultValue?: T;
    },
): IEditor<T[]> {
    const title = options?.title ?? ((index) => `Element ${index}`);

    // Change the flex direction of the container to column
    view.container.style.flexDirection = "column";
    view.title.classList.add("array-title");

    const elementsContainer = createElement("div", { className: "elements-container", parent: view.view });

    // Create the button to add new elements
    const addButton = createElement("button", { className: "button add", parent: view.title });
    addButton.innerText = "Add +";

    // Create an event emitter
    const changed = new EventEmitter<T[]>();

    let currentEditors = new Array<IEditor<T>>();
    const currentValues = new Array<T>();

    // Function to add a new element editor
    const addElement = () => {
        const index = currentEditors.length;
        const elementView = createView(title(index), elementsContainer);
        const elementEditor = elementEditorFactory(elementView);

        elementView.container.classList.add("slider");

        currentValues.push(options?.defaultValue ?? (null as T));
        if (options?.defaultValue) elementEditor.update(options.defaultValue);

        // Create the button to remove the element
        const removeButton = createElement("button", { className: "button", parent: elementView.view });
        removeButton.innerText = "-";

        // Add event listener to remove the element
        removeButton.addEventListener("click", () => {
            elementsContainer.removeChild(elementView.container);
            currentValues.removeAt(currentEditors.indexOf(elementEditor));
            currentEditors.remove(elementEditor);

            for (const editor of currentEditors) editor.view.title.textContent = title(currentEditors.indexOf(editor));

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
        changed.emit(currentValues);
    };

    // Add event listener to add new elements
    addButton.addEventListener("click", () => {
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
    };

    return { changed, update, view };
}
