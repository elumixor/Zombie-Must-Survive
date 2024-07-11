import { inject } from "@core/di";
import { Container, Sprite, Ticker } from "pixi.js";
import { Player } from "./player/player";
import { all, EventEmitter } from "@elumixor/frontils";
import { gsap } from "gsap";
import { responsive } from "@core/responsive";

@responsive
export class Crystal extends Container {
    readonly collected = new EventEmitter();

    @responsive({ scale: 0.3, anchor: [0.5, 1] })
    private readonly sprite = Sprite.from("crystal");
    @responsive({ anchor: [0.5, 0] })
    private readonly shadow = Sprite.from("shadow");
    private readonly player = inject(Player);

    pickupDistance = 50;
    radius = 0;
    speed = 100000;

    xp = 2;

    private collecting = false;

    constructor() {
        super();

        this.addChild(this.shadow, this.sprite);

        Ticker.shared.add(this.checkCollection);

        this.collected.subscribe(() => (this.player.xp += this.xp));

        void this.animateShow();
    }

    async animateShow() {
        await all(
            gsap.fromTo(this.sprite, { y: 20 }, { y: 0, duration: 0.2, ease: "expo.out" }),
            gsap.fromTo(this.shadow.scale, { x: 0.1, y: 0.1 }, { x: 0.3, y: 0.3, duration: 0.2, ease: "expo.out" }),
        );

        gsap.to(this.sprite, { y: -20, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(this.shadow.scale, { x: 0.2, y: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    private get triggerDistance() {
        return this.pickupDistance + this.radius + this.player.radius;
    }

    private readonly checkCollection = () => {
        const distance = this.distanceTo(this.player);

        if (distance < this.triggerDistance) {
            Ticker.shared.remove(this.checkCollection);
            Ticker.shared.add(this.flyToPlayer);
            gsap.to(this.shadow.scale, { x: 0, y: 0, duration: 0.15 });
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
