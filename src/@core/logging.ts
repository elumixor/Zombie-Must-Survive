import { getElementOrThrow } from "@elumixor/frontils";

declare global {
    function log(...args: unknown[]): void;
    // If PROD - will have no effect
    const debug: {
        (...args: unknown[]): void;
        fn(fn: () => void): void;
    };
    /** Draws a string directly on the screen. Has no effect on PROD builds */
    function logs(
        value: unknown,
        options?: { duration?: number; color?: string; key?: number | string; useConsole?: boolean },
    ): void;
}

Reflect.defineProperty(globalThis, "log", {
    value(...args: unknown[]) {
        // eslint-disable-next-line no-console
        console.log(...args);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "debug", {
    value: import.meta.env.DEV
        ? (() => {
              const fn = (...args: unknown[]) => {
                  // eslint-disable-next-line no-console
                  console.warn(...args);
              };
              Reflect.set(fn, "fn", (fn: () => void) => fn());
              return fn;
          })()
        : (() => {
              const fn = () => undefined;
              Reflect.set(fn, "fn", () => undefined);
              return fn;
          })(),
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "logs", {
    value: import.meta.env.DEV
        ? (value: unknown, { duration = 2, color = "auto", key = -1 as string | number, useConsole = true } = {}) => {
              let div = document.getElementById("__debug-string");
              if (!div) {
                  div = document.createElement("div");
                  div.id = "__debug-string";
                  div.style.position = "absolute";
                  div.style.top = "0";
                  div.style.left = "0";
                  div.style.zIndex = "9999";
                  div.style.color = "rgb(255 255 255)";
                  div.style.textShadow = "0 0 25px black";
                  div.style.fontFamily = "monospace";
                  div.style.fontSize = "14px";
                  div.style.fontWeight = "medium";
                  div.style.padding = "8px";
                  div.style.pointerEvents = "none";
                  getElementOrThrow("canvas-container").appendChild(div);

                  Reflect.defineProperty(globalThis, "__debug-string-map", {
                      value: new Map<number, { timerId: number; div: HTMLElement }>(),
                      writable: false,
                      enumerable: false,
                      configurable: false,
                  });
              }

              const map = Reflect.get(globalThis, "__debug-string-map") as Map<
                  number | string,
                  { timerId: number; div: HTMLElement }
              >;

              const stringDiv = document.createElement("div");
              stringDiv.textContent = String(value);
              stringDiv.style.color = color;
              div.appendChild(stringDiv);

              let timerId = 0;
              if (duration >= 0)
                  timerId = window.setTimeout(() => {
                      div.removeChild(stringDiv);
                      map.delete(key);
                  }, duration * 1000);

              if (key !== -1) {
                  const mapValue = map.get(key);
                  if (mapValue) {
                      const { timerId, div: childDiv } = mapValue;
                      window.clearTimeout(timerId);
                      div.removeChild(childDiv);
                  }

                  map.set(key, { timerId, div: stringDiv });
              }

              // eslint-disable-next-line no-console
              if (useConsole) console.log(String(value));
          }
        : () => undefined,
    writable: false,
    enumerable: false,
    configurable: false,
});
