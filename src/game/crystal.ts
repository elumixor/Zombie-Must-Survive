import { inject } from "@core/di";
import { Container, Sprite, Ticker } from "pixi.js";
import { Player } from "./player";
import { EventEmitter } from "@elumixor/frontils";
import { gsap } from "gsap";

export class Crystal extends Container {
    readonly collected = new EventEmitter();

    private readonly sprite = Sprite.from("crystal");
    private readonly player = inject(Player);

    pickupDistance = 50;
    radius = 0;
    speed = 100000;

    xp = 2;

    private collecting = false;

    constructor() {
        super();

        this.addChild(this.sprite);
        this.sprite.anchor.set(0.5);

        Ticker.shared.add(this.checkCollection);
    }

    private get triggerDistance() {
        return this.pickupDistance + this.radius + this.player.radius;
    }

    private readonly checkCollection = () => {
        const distance = this.distanceTo(this.player);

        if (distance < this.triggerDistance) {
            Ticker.shared.remove(this.checkCollection);
            Ticker.shared.add(this.flyToPlayer);
        }
    };

    private readonly flyToPlayer = (dt: number) => {
        const distance = this.distanceTo(this.player);

        if (distance < 1) Ticker.shared.remove(this.flyToPlayer);

        if (distance < this.radius + this.player.radius && !this.collecting) {
            this.collecting = true;
            this.collected.emit();
            gsap.to(this, { alpha: 0, duration: 0.15 });
            gsap.to(this.scale, {
                x: 1.5,
                y: 1.5,
                duration: 0.15,
                onComplete: () => {
                    gsap.to(this.scale, {
                        x: 0,
                        y: 0,
                        duration: 0.15,
                        onComplete: () => {
                            Ticker.shared.remove(this.flyToPlayer);
                            this.destroy();
                        },
                    });
                },
            });
        } else {
            const angle = this.angleTo(this.player);
            const speed = Math.min(Math.pow(this.speed / distance, 0.25), 10);
            this.x += Math.cos(angle) * speed * dt;
            this.y += Math.sin(angle) * speed * dt;
        }
    };
}
