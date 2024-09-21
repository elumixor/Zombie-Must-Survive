import { EventEmitter } from "@elumixor/frontils";
import type { IResetView } from "./imy-element";
import "./styles/handle-view.scss";
import { transformText } from "./transform-text";

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

const closeContextMenus = new EventEmitter();

export function createView(propertyName: string, parent?: HTMLElement): IResetView {
    const container = createElement("div", { className: "handle-view-container", parent });
    const header = createElement("p", { className: "handle-view-header", parent: container });
    const content = createElement("div", { className: "handle-view-content", parent: container });
    const contextMenu = createElement("div", { className: "handle-view-context-menu", parent: container });
    const refreshButton = createElement("button", {
        className: "handle-view-refresh-button",
        parent: contextMenu,
        textContent: "Reset",
    });

    const resetRequested = new EventEmitter();

    refreshButton.addEventListener("click", () => {
        resetRequested.emit();
        contextMenu.style.display = "none";
    });

    container.addEventListener("contextmenu", (e) => {
        closeContextMenus.emit();

        e.preventDefault();
        e.stopPropagation();

        refreshButton.innerText = "Reset " + transformText(String(header.childNodes[0].textContent));
        contextMenu.style.display = "block";
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
    });

    closeContextMenus.subscribe(() => (contextMenu.style.display = "none"));

    document.addEventListener("click", () => (contextMenu.style.display = "none"));

    contextMenu.style.display = "none";

    header.textContent = transformText(propertyName);

    return {
        title: propertyName,
        content,
        header,
        container,
        addChild: (child) => content.appendChild(child.container),
        resetRequested,
    };
}
