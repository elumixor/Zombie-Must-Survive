import { Actor, CircleColliderComponent, inject, PhysicsComponent, TrackerComponent } from "@core";
import { responsive } from "@core/responsive";
import { all, EventEmitter } from "@elumixor/frontils";
import { GameState } from "game-zombie/game-state";
import { Sprite } from "pixi.js";

@responsive
export class XpCrystal extends Actor {
    private readonly playerState = inject(GameState).player;

    readonly collected = new EventEmitter();

    xp = 1;
    attractionRadius = 200;
    collectRadius = 5;

    @responsive({ scale: 0.3, anchor: [0.5, 1] })
    private readonly sprite = this.addChild(Sprite.from("crystal"));

    @responsive({ anchor: [0.5, 0] })
    private readonly shadow = this.addChild(Sprite.from("shadow"));

    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly tracker = this.addComponent(new TrackerComponent(this));
    private readonly physics = this.addComponent(new PhysicsComponent(this));

    constructor() {
        super();

        this.layer = "foreground";

        this.collider.isTrigger = true;
        this.collider.targetTags.add("player");

        this.tracker.acceptanceDistance = 0;
        this.tracker.forceRequested.subscribe((force) => this.physics.addForce(force));

        this.physics.drag = 0.8;

        this.collected.subscribe(() => (this.playerState.xp += this.xp));
    }

    override beginPlay() {
        super.beginPlay();

        this.collider.radius = this.attractionRadius;
        void this.animateShow();
    }

    private async animateShow() {
        this.sprite.y = 20;
        await all(
            this.time.to(this.sprite, { y: 0, duration: 0.2 }),
            this.time.fromTo(this.shadow.scale, { x: 0.1, y: 0.1 }, { x: 0.3, y: 0.3, duration: 0.2 }),
        );

        this.time.to(this.sprite, { y: -20, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        this.time.to(this.shadow.scale, { x: 0.2, y: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });

        this.collider.currentCollisions.clear();
        this.collider.collisionEntered.subscribeOnce((colliders) => this.flyToPlayer(colliders.first.actor));
    }

    private flyToPlayer(target: Actor) {
        this.tracker.target = target;
        void this.time
            .to(this.shadow.scale, { x: 0, y: 0, duration: 0.15, overwrite: true })
            .then(() => this.removeChild(this.shadow));

        this.collider.currentCollisions.clear();
        this.collider.radius = this.collectRadius;
        this.collider.collisionEntered.subscribeOnce(() => this.collect());
    }

    private async collect() {
        this.collected.emit();
        this.removeComponent(this.collider);
        this.collider.destroy();
        await all(
            this.time.to(this.sprite, { alpha: 0, duration: 0.5, ease: "expo.out", overwrite: true }),
            this.time.to(this.sprite.scale, { x: 0.4, y: 0.4, duration: 0.5, overwrite: true }),
        );
        this.removeComponent(this.tracker, this.physics);
        this.destroy();
    }
}
