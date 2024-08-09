import { di } from "@elumixor/di";
import type { Constructor } from "@elumixor/frontils";
import { Group } from "@pixi/layers";
import { Container } from "pixi.js";
import { Actor } from "./actor";
import { Camera } from "./camera";
import { CollisionManager } from "./colliders";
import { Vec2 } from "./extensions";
import { Layers } from "./layers";
import { Resizer, responsive, type IDimensions, type IResizeObservable } from "./responsive";

/**
 * Levels is an actor that has loading and unloading logic,
 * as well as some level-wide components, such as {@link CollisionManager}
 */
@responsive
export class Level extends Actor implements IResizeObservable {
    private readonly resizer = di.inject(Resizer);
    readonly collisionManager = this.addComponent(new CollisionManager(this));

    // We can implement a simple camera system using a camera position
    readonly camera = new Camera();
    readonly layers = new Layers();
    readonly ui = this.addChild(new Actor());
    private readonly basePosition = new Vec2();

    constructor() {
        super();

        this.layers.add("default");
        const uiLayer = this.layers.add("ui", new Group(1000));
        this.ui.parentLayer = uiLayer;

        this.camera.updated.subscribe(() => this.updatePosition());
    }

    get screenSize() {
        const { width, height } = this.resizer.dimensions;
        return new Vec2(width, height);
    }

    resize({ scale, clientWidth, clientHeight }: IDimensions) {
        this.scale.set(scale);
        this.basePosition.set(clientWidth / 2, clientHeight / 2);
        this.updatePosition();
    }

    /** Called after the level is unloaded */
    onUnloaded() {
        this.tickEnabled = false;
        this.time.remove(this.updateCallback);
        return Promise.resolve();
    }

    /** Called after the level is loaded */
    onLoaded() {
        logs("Level loaded");

        this.beginPlay();
        this.tickEnabled = true;
        this.time.add(this.updateCallback);

        return Promise.resolve();
    }

    getWorldPosition(container: Container) {
        return this.toLocal(Vec2.zero, container);
    }

    setWorldPosition(container: Container, position: Vec2) {
        container.position = container.parent.toLocal(position, this);
    }

    screenToWorld(screenPosition: Vec2) {
        return this.toLocal(screenPosition.mul(this.scale));
    }

    allActors() {
        function* getActorsRecursively(actor: Actor): Generator<Actor> {
            yield actor;
            for (const child of actor.childActors) yield* getActorsRecursively(child);
        }

        return this.childActors.flatMap((actor) => [...getActorsRecursively(actor)]);
    }

    getActorsOfType<T extends Constructor<Actor>>(type: T) {
        return this.allActors().filter((actor) => actor instanceof type) as InstanceType<T>[];
    }

    private readonly updateCallback = (dt: number) => this.update(dt);

    private updatePosition() {
        // To emulate the camera effect, we move the level container
        // to the opposite direction of the cameraPoint
        // We should also not forget to scale the position
        const { scale } = this.resizer;
        this.scale.copyFrom(this.camera.scale.mul(scale));
        this.position.copyFrom(this.basePosition).isub(this.camera.position.mul(this.scale));

        // We should keep UI invariant to the camera position and scale
        this.ui.scale.set((1 / this.scale.x) * scale, (1 / this.scale.y) * scale);
        this.ui.x = -this.position.x / this.scale.x;
        this.ui.y = -this.position.y / this.scale.y;
    }
}
