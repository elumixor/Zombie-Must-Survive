/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-this-alias */

import { getLocalStorage } from "@core";
import { EventEmitter, nonNull, type Constructor } from "@elumixor/frontils";
import { configurator } from "../configurator";
import type { IResetView } from "../imy-element";
import type { IEditor } from "../editors/editor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HandleOptions<T extends Handle<any> = Handle<any>> {
    tabGroup?: string;
    saved?: boolean;
    section?: string;
    onUpdate?: (instances: Iterable<object>, value: unknown, handle: T) => void;
    onCreated?: (instances: Iterable<object>, value: unknown, handle: T) => void;
}

export abstract class Handle<T = unknown, U = T> {
    readonly changed = new EventEmitter<{ instances: Iterable<object>; value: U }>();
    readonly created = new EventEmitter<{ instances: Iterable<object>; value: U }>();
    private readonly storage = nonNull(getLocalStorage());
    instances = new Set<object>();
    private Class!: object;
    private propertyKey!: string | symbol;
    private view!: IResetView;
    id!: string;
    private saved!: boolean;
    private tabGroup?: string;
    private section?: string;

    static create<T, Rest extends unknown[]>(factory: (view: IResetView, ...args: Rest) => IEditor<T>) {
        return (...options: Rest) =>
            new (class extends Handle<T> {
                private editor!: IEditor<T>;
                private readonly options;

                constructor(...options: Rest) {
                    super();
                    this.options = options;
                }

                override addToView(view: IResetView) {
                    this.editor = factory(view, ...this.options);
                    return this.editor;
                }

                override updateView(value: T) {
                    this.editor.update(value);
                }
            })(...options);
    }

    protected get propertyValue() {
        return Reflect.get(this.instances.first, this.propertyKey) as T;
    }

    private get storedValue() {
        const value = this.storage.getItem(this.id);
        if (!value) return undefined;

        return this.deserialize(value);
    }

    get serialized() {
        return [this.id, this.storage.getItem(this.id) ?? ""];
    }

    register(Class: Constructor, propertyKey: string | symbol, options?: HandleOptions) {
        this.Class = Class;
        this.propertyKey = propertyKey;
        this.tabGroup = options?.tabGroup;
        this.section = options?.section;
        this.saved = options?.saved ?? true;
    }

    instantiate(instance: object, Class: Constructor) {
        if (this.instances.nonEmpty) {
            this.instances.add(instance);
            if (this.saved) this.load();
            return;
        }

        this.instances.add(instance);

        if (!this.tabGroup) this.tabGroup = Class.name;

        const { view, id } = configurator.addHandle(this, String(this.propertyKey), this.tabGroup, this.section);
        this.view = view;
        this.id = id;

        // view.addChild(this);

        if (this.saved) {
            // Try loading the value from the storage
            this.load();

            // Save whatever we have now to the storage
            this.save();
        }

        const { changed: viewChanged, resetRequested } = this.addToView(this.view);

        const value = this.get();
        this.updateView(value);
        this.created.emit({ instances: this.instances, value });
        viewChanged.subscribe((value) => this.onViewChanged(value));
        resetRequested.subscribe(() => configurator.resetSingle(this.id));
    }

    copy() {
        const result = Object.create(this) as typeof this;
        result.instances = new Set();
        return result;
    }

    reset() {
        this.load();
        this.updateView(this.get());
    }

    updateInstances() {
        const value = this.get();
        this.onViewChanged(value);
    }

    protected abstract addToView(view: IResetView): { changed: EventEmitter<U>; resetRequested: EventEmitter };
    protected abstract updateView(value: U): void;

    /** Can be overridden to operate, for example, on some property of the object, in case the value is not primitive */
    protected get() {
        return this.extractValue(this.propertyValue);
    }

    /** Can be overridden, e.g. for objects, to not change the reference, but instead just modify the inner value */
    protected set(value: U, instance: object) {
        Reflect.set(instance, this.propertyKey, value);
    }

    /** Can be overridden for custom deserialization */
    protected deserialize(value: string) {
        return JSON.parse(value) as U;
    }

    /** Can be overridden for custom serialization */
    protected serialize(value: U) {
        return JSON.stringify(value);
    }

    private onViewChanged(value: U) {
        for (const instance of this.instances) this.set(value, instance);
        if (this.saved) this.save();
        this.changed.emit({ instances: this.instances, value });
    }

    /* Load and save value to the local storage  */
    protected load() {
        const { storedValue } = this;
        if (storedValue === undefined) return;
        for (const instance of this.instances) this.set(storedValue, instance);
    }
    protected save() {
        this.storage.setItem(this.id, this.serialize(this.get()));
    }

    /* Extract value */
    protected extractValue(value: T): U {
        return value as unknown as U;
    }
}

const handleMap = new Map<object, Set<Handle>>();

export function registerHandle(
    Class: Constructor,
    propertyKey: string | symbol,
    handle: Handle,
    options?: HandleOptions,
) {
    const target = getTarget(Class);

    // Each target contains a set of handles
    // Add the current handle to the target
    const handles = handleMap.get(target) ?? new Set();
    handles.add(handle);
    handleMap.set(target, handles);

    // Also, pass info to the handle
    handle.register(Class, propertyKey, options);
}

const collected = new Map<object, Set<Handle>>();

/** When the instance is created, link handles to it */
export function registerInstance(instance: object, target: object) {
    const Class = getTarget(target);
    target = Class;

    // Find all relevant handles
    let allHandles = collected.get(target);
    if (!allHandles) {
        allHandles = new Set();
        collected.set(target, allHandles);

        while (target !== Object.prototype) {
            const handles = handleMap.get(target) ?? new Set();
            for (const handle of handles) allHandles.add(handle.copy());

            target = Reflect.getPrototypeOf(target)!;
        }
    }

    // Add instance to handles
    for (const handle of allHandles) handle.instantiate(instance, Class);
    for (const handle of allHandles) handle.updateInstances();
}

function getTarget(target: object) {
    return (target.constructor !== Function ? target.constructor : target) as Constructor;
}
