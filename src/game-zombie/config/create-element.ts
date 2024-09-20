import type { IHandleView } from "./imy-element";
import "./styles/handle-view.scss";

export function createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T = "div" as T,
    {
        parent = undefined as HTMLElement | undefined,
        className = "",
        textContent = undefined as string | undefined,
    } = {},
): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    element.className = className;
    parent?.appendChild(element);
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

export function createView(propertyName: string, parent?: HTMLElement): IHandleView {
    const container = createElement("div", { className: "handle-view-container", parent });
    const header = createElement("p", { className: "handle-view-header", parent: container });
    const content = createElement("div", { className: "handle-view-content", parent: container });

    header.textContent = propertyName;

    return {
        title: propertyName,
        content,
        header,
        container,
        addChild: (child) => content.appendChild(child.container),
    };
}
