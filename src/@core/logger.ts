declare global {
    function log(...args: unknown[]): void;
    function debug(...args: unknown[]): void; // based on the environment variable
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
        ? (...args: unknown[]) => {
              // eslint-disable-next-line no-console
              console.warn(...args);
          }
        : () => undefined,
    writable: false,
    enumerable: false,
    configurable: false,
});
