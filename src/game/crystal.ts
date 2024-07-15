import { inject } from "@core/di";
import { responsive } from "@core/responsive";
import { all, EventEmitter } from "@elumixor/frontils";
import { gsap } from "gsap";
import { Container, Sprite } from "pixi.js";
import { GameTime } from "./game-time";
import { Player } from "./player/player";

@responsive
export class Crystal extends Container {
    private readonly player = inject(Player);
    private readonly time = inject(GameTime);

    @responsive({ scale: 0.3, anchor: [0.5, 1] })
    private readonly sprite = Sprite.from("crystal");

    @responsive({ anchor: [0.5, 0] })
    private readonly shadow = Sprite.from("shadow");

    private readonly pickupDistance = 50;
    private readonly radius = 0;
    private readonly triggerDistance = this.pickupDistance + this.radius + this.player.radius;
    private readonly speed = 100000;
    private readonly collected = new EventEmitter();

    private collecting = false;

    constructor({ xp = 1 } = {}) {
        super();

        this.addChild(this.shadow, this.sprite);

        this.time.add(this.checkCollection);

        this.collected.subscribe(() => (this.player.xp += xp));

        void this.animateShow();
    }

    private async animateShow() {
        await all(
            this.time.fromTo(this.sprite, { y: 20 }, { y: 0, duration: 0.2 }),
            this.time.fromTo(this.shadow.scale, { x: 0.1, y: 0.1 }, { x: 0.3, y: 0.3, duration: 0.2 }),
        );

        this.time.to(this.sprite, { y: -20, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        this.time.to(this.shadow.scale, { x: 0.2, y: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
    private readonly checkCollection = () => {
        const distance = this.distanceTo(this.player);

        if (distance < this.triggerDistance) {
            gsap.killTweensOf(this.sprite);
            gsap.killTweensOf(this.shadow.scale);
            this.time.remove(this.checkCollection);
            this.time.add(this.flyToPlayer);
            this.time.to(this.shadow.scale, { x: 0, y: 0, duration: 0.15 });
        }
    };

    private readonly flyToPlayer = (dt: number) => {
        const distance = this.distanceTo(this.player);

        if (distance < 1) this.time.remove(this.flyToPlayer);

        if (distance < this.radius + this.player.radius && !this.collecting) {
            this.collecting = true;
            this.collected.emit();
            this.time.to(this, { alpha: 0, duration: 0.15 });
            this.time.to(this.scale, {
                x: 1.5,
                y: 1.5,
                duration: 0.15,
                onComplete: () => {
                    this.time.to(this.scale, {
                        x: 0,
                        y: 0,
                        duration: 0.15,
                        onComplete: () => {
                            this.time.remove(this.flyToPlayer);
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
