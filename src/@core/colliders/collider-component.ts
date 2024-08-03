import { EventEmitter } from "@elumixor/frontils";
import { Component } from "../components";
import { CollisionManager } from "./collision-manager";
import type { Vec2 } from "@core/extensions";

export class CircleColliderComponent extends Component {
    readonly forceRequested = new EventEmitter<Vec2>();
    readonly collisionEntered = new EventEmitter<Set<CircleColliderComponent>>();
    readonly collisionExited = new EventEmitter<Set<CircleColliderComponent>>();

    radius = 20;
    pushStrength = 1;
    isTrigger = false;
    readonly targetTags = new Set<string>();
    readonly selfTags = new Set<string>();

    private _lastCollisions = new Set<CircleColliderComponent>();
    private get collisionManager() {
        const manager = this.level.getComponent(CollisionManager);
        assert(manager, "Collision manager not found");
        return manager;
    }

    get currentCollisions() {
        return this._lastCollisions;
    }
    set currentCollisions(value) {
        const newCollisions = value.difference(this._lastCollisions);
        const removedCollisions = this._lastCollisions.difference(value);

        this._lastCollisions = value;

        if (newCollisions.size > 0) this.collisionEntered.emit(newCollisions);
        if (removedCollisions.size > 0) this.collisionExited.emit(removedCollisions);
    }

    override beginPlay() {
        super.beginPlay();
        this.collisionManager.add(this);
    }

    override destroy() {
        this.collisionManager.delete(this);
        super.destroy();
    }
}
