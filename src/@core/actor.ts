import { Game } from "@core/game";
import { di } from "@elumixor/di";
import type { Constructor } from "@elumixor/frontils";
import { Container, DisplayObject } from "pixi.js";
import { Component } from "./components";
import { Time } from "./time";

/**
 * Actor is a container for {@link Component}s that can be updated every frame ({@link Actor.update})
 * and has a {@link Container} and thus can be added into the scene tree.
 * Actors have {@link tickEnabled} by default.
 */
export class Actor extends Container {
    /** Name of the {@link Layer} to put this actor into. */
    layer?: string;

    /** Whether the component should be updated every frame */
    tickEnabled = true;

    /** Quick reference to the {@link Game} class */
    protected readonly game = di.inject(Game);

    /** Quick reference to the game {@link Time} */
    protected readonly time = di.inject(Time);

    /** List of the currently added components */
    protected readonly components = new Set<Component>();

    // This exists in order to correctly trigger beginPlay when the actor is added to the scene
    // and not just when it is added before parent actor beginPlay is called
    private beginPlayCalled = false;

    /** Returns all actor children */
    get childActors() {
        return this.children.filter((child) => child instanceof Actor);
    }

    /** Reference to the current level */
    get level() {
        const { currentLevel } = this.game;
        assert(currentLevel, "This actor is not in any level");
        return currentLevel;
    }

    /** The most top-level parent actor of the actor */
    get rootParentActor() {
        let parent = this as Actor;
        while (parent.parent instanceof Actor) parent = parent.parent;
        return parent;
    }

    get worldPosition() {
        return this.level.getWorldPosition(this);
    }
    set worldPosition(value) {
        this.level.setWorldPosition(this, value);
    }

    override addChild<T extends DisplayObject[]>(...children: T) {
        const result = super.addChild(...children);

        if (this.beginPlayCalled) for (const child of children) if (child instanceof Actor) child.beginPlay();

        return result;
    }

    /** Removes a child from the actor */
    override removeChild<T extends DisplayObject[]>(...children: T) {
        const result = super.removeChild(...children);
        return result;
    }

    /** Adds a component to the actor */
    addComponent<T extends Component[]>(...components: T) {
        for (const component of components) this.components.add(component);
        return components.first as T[0];
    }

    /** Removes a component from the actor */
    removeComponent<T extends Component[]>(...components: T) {
        for (const component of components) this.components.delete(component);
        return components.first as T[0];
    }

    /** Checks if the actor has a component of the given type */
    hasComponent(ClassOrComponent: Constructor<Component> | Component) {
        if (ClassOrComponent instanceof Component) return this.components.has(ClassOrComponent);
        return this.getComponent(ClassOrComponent) !== undefined;
    }

    /** Returns first component of the given type or undefined if not found */
    getComponent<T extends Constructor<Component>>(Class: T) {
        for (const component of this.components) if (component instanceof Class) return component as InstanceType<T>;
    }

    /** Destroys the actor and all its children and components and removes it from the parent */
    override destroy() {
        this.parent.removeChild(this);
        for (const component of [...this.components]) component.destroy();
        for (const child of this.children) child.destroy();
        super.destroy();
    }

    /** Returns the distance to the other actor */
    distanceTo(other: Actor) {
        return this.worldPosition.distanceTo(other.worldPosition);
    }

    /** Called recursively for all children. First triggers in components, then in children, then in the actor itself */
    beginPlay() {
        if (this.beginPlayCalled) return;
        this.beginPlayCalled = true;

        const layer = this.level.layers.get(this.layer ?? "default");
        if (layer) this.parentLayer = layer;

        for (const component of this.components) component.beginPlay();
        for (const child of this.childActors) child.beginPlay();
    }

    /** Called every frame if {@link tickEnabled} is set to `true` */
    update(dt: number) {
        for (const component of this.components) if (component.tickEnabled) component.update(dt);
        for (const actor of this.childActors) if (actor.tickEnabled) actor.update(dt);
    }
}
