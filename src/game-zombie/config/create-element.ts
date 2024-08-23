export function createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T = "div" as T,
    { parent = document.body, className = "", textContent = undefined as string | undefined } = {},
): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    element.className = className;
    parent.appendChild(element);
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

export function createView(propertyName: string, parent?: HTMLElement) {
    const container = createElement("div", { className: "item-container", parent });
    const title = createElement("p", { className: "item-title", parent: container });
    const view = createElement("div", { parent: container });

    title.textContent = propertyName;

    return { view, title, container };
}
