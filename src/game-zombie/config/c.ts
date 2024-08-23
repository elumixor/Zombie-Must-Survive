import { num, registerHandle, registerInstance, type Handle } from "./handles";
import type { AbstractConstructor, Constructor } from "@elumixor/frontils";

/** When used on a class, will add a call after constructor() is done to register instance */
function c<T extends AbstractConstructor>(target: T): T;
/** When used as a property decorator, accept a handle and register it under default group and tab */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function c(handle: Handle<any>): PropertyDecorator;
/** When used as a property decorator, accept a handle and register it under custom group and tab */
function c(tabGroup: string, handle: Handle): PropertyDecorator;
function c(...args: unknown[]) {
    if (args.length === 1 && typeof args[0] === "function") return classDecorator(args[0] as Constructor);
    return propertyDecorator(...args);
}

function classDecorator(target: Constructor) {
    return class extends target {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...(args as unknown[]));
            registerInstance(this, target);
        }
    };
}

/** Register the given handle */
function propertyDecorator(...args: unknown[]) {
    return (target: object, propertyKey: string | symbol) => {
        let tabGroup: string | undefined = undefined;
        let handle: Handle;

        if (args.length === 1) {
            handle = args[0] as Handle;
        } else {
            tabGroup = args[0] as string;
            handle = args[1] as Handle;
        }

        registerHandle(target as Constructor, propertyKey, handle, tabGroup);
    };
}

c.num = num;

export { c };
