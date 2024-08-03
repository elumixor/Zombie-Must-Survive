declare global {
    /** True for dev environment, false for prod */
    const development: boolean;
}

Reflect.defineProperty(globalThis, "development", {
    get() {
        return import.meta.env.DEV;
    },
    enumerable: false,
    configurable: false,
});

// eslint-disable-next-line no-console
console.log(`%cENV: ${import.meta.env.MODE}`, "color: cyan;");
