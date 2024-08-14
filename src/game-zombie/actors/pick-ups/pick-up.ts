import { Actor, CircleColliderComponent, PhysicsComponent, TrackerComponent } from "@core";
import { EventEmitter } from "@elumixor/frontils";

export class PickUp extends Actor {
    readonly collected = new EventEmitter();

    attractionRadius = 200;
    collectRadius = 20;

    protected readonly collider = this.addComponent(new CircleColliderComponent(this));
    protected readonly tracker = this.addComponent(new TrackerComponent(this));
    protected readonly physics = this.addComponent(new PhysicsComponent(this));

    constructor() {
        super();

        this.layer = "foreground";
        this.collider.isTrigger = true;
        this.collider.targetTags.add("pickUp");

        this.tracker.force = 7;
        this.tracker.acceptanceDistance = 0;
        this.tracker.forceRequested.subscribe((force) => this.physics.addForce(force));

        this.physics.drag = 0.75;
    }

    override beginPlay() {
        super.beginPlay();
        this.collider.radius = this.attractionRadius;
        void this.animateShow().then(() => this.startTracking());
    }

    protected animateShow() {
        return Promise.resolve();
    }

    protected startTracking() {
        this.collider.currentCollisions.clear();
        this.collider.collisionEntered.subscribeOnce((colliders) => this.flyToTarget(colliders.first.actor));
    }

    protected flyToTarget(target: Actor) {
        this.tracker.target = target;
        this.collider.currentCollisions.clear();
        this.collider.radius = this.collectRadius;
        this.collider.collisionEntered.subscribeOnce(() => this.collect());
    }

    protected async collect() {
        this.collected.emit();
        this.removeComponent(this.collider);
        this.collider.destroy();
        await this.animateHide();
        this.removeComponent(this.tracker, this.physics);
        this.destroy();
    }

    protected animateHide() {
        return Promise.resolve();
    }
}
