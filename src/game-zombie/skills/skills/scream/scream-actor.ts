import { Actor, circleSprite, CircleColliderComponent } from "@core";
import { Enemy } from "game-zombie/actors";

export class ScreamActor extends Actor {
    freezeDuration = 1;
    duration = 1;
    radius = 1;

    private readonly sprite = this.addChild(circleSprite({ radius: 50, color: "rgb(10, 162, 200)", alpha: 0.5 }));
    private readonly collider = this.addComponent(new CircleColliderComponent(this));

    constructor() {
        super();

        this.layer = "projectiles";
        this.collider.isTrigger = true;
        this.collider.targetTags.add("enemy");
        this.collider.radius = 0;

        this.collider.collisionEntered.subscribe((other) => {
            for (const { actor } of other) {
                assert(actor instanceof Enemy);
                actor.freeze(this.freezeDuration);
            }
        });
    }

    override beginPlay() {
        if (this.beginPlayCalled) return;
        super.beginPlay();
        void this.animate();
    }

    private async animate() {
        const p = { radius: 0 };
        await this.time.to(p, {
            radius: this.radius,
            duration: this.duration * 0.8,
            onUpdate: () => {
                this.collider.radius = p.radius;
                this.sprite.uniformHeight = p.radius * 2;
            },
        });

        await this.time.to(this, {
            alpha: 0,
            duration: 0.2,
        });

        this.destroy();
    }
}
