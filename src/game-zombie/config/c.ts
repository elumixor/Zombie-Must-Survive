import { bool } from "./editors/bool";
import { button } from "./editors/button";
import {
    num,
    registerHandle,
    registerInstance,
    type HandleOptions,
    type Handle,
    unsubscribeInstance,
    arr,
} from "./handles";
import type { AbstractConstructor, Constructor } from "@elumixor/frontils";

/** When used on a class, will add a call after constructor() is done to register instance */
function c<T extends AbstractConstructor>(target: T): T;
/** When used as a property decorator, accept a handle and register it under default group and tab */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function c<T extends Handle<any>>(handle: T, options?: HandleOptions<T>): PropertyDecorator;
function c(...args: unknown[]) {
    if (args.length === 1 && typeof args[0] === "function") return classDecorator(args[0] as Constructor);
    return propertyDecorator(...(args as [Handle, HandleOptions | undefined]));
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
function propertyDecorator(handle: Handle, options?: HandleOptions): PropertyDecorator {
    const { onUpdate, onCreated } = options ?? {};
    if (onUpdate) handle.changed.subscribe(({ instances, value }) => onUpdate(instances, value, handle));
    if (onCreated) handle.created.subscribe(({ instances, value }) => onCreated(instances, value, handle));

    return (target: object, propertyKey: string | symbol) => {
        registerHandle(target as Constructor, propertyKey, handle, options);
    };
}

c.num = num;
c.bool = bool;
c.arr = arr;
c.button = button;

c.unsubscribe = unsubscribeInstance;

export { c };
