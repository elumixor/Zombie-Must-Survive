declare global {
    function log(...args: unknown[]): void;
    // If PROD - will have no effect
    const debug: {
        (...args: unknown[]): void;
        fn(fn: () => void): void;
    };
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
