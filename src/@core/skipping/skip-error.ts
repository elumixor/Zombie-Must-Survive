const skipSymbol = Symbol();

export class SkipError extends Error {
    readonly [skipSymbol] = true;

    constructor(stack?: string) {
        super();

        this.name = "Unhandled Skip Error";
        this.stack = stack;
    }
}

export function isSkipError(e: unknown) {
    return e !== undefined && Object.getOwnPropertySymbols(e).includes(skipSymbol);
}
