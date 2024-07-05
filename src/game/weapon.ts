import { inject } from "@core/di";
import { EventEmitter } from "@elumixor/frontils";
import { Container, Sprite, type IPointData } from "pixi.js";
import { Interval } from "./interval";
import { Player } from "./player";
import { ZombieManager } from "./zombie-manager";
import { gsap } from "gsap";

export class Weapon {
    readonly particleSpawned = new EventEmitter<Container>();

    particle;
    numParticles;
    travelSpeed;
    fireRate;
    travelDistance;
    damage;
    duration;
    spread;
    burst;
    radius;
    rotation;

    target?: IPointData;

    private readonly interval;

    private readonly zombies = inject(ZombieManager).zombies;
    private readonly player = inject(Player);

    constructor({
        particle,
        numParticles,
        travelSpeed,
        fireRate,
        travelDistance,
        damage,
        spread,
        burst,
        radius,
        rotation = 0,
    }: {
        particle: string;
        numParticles: number;
        travelSpeed: number;
        travelDistance: number;
        fireRate: number;
        damage: number;
        spread: number;
        burst: number;
        radius: number;
        rotation?: number;
    }) {
        this.particle = particle;
        this.numParticles = numParticles;
        this.travelSpeed = travelSpeed;
        this.fireRate = fireRate;
        this.travelDistance = travelDistance;
        this.damage = damage;
        this.spread = spread;
        this.burst = burst;
        this.rotation = rotation;
        this.radius = radius;
        this.duration = this.travelDistance / this.travelSpeed;

        debug(this.fireRate);
        this.interval = new Interval(this.attack, this.fireRate);
    }

    start() {
        this.interval.start();
    }

    stop() {
        this.interval.pause();
    }

    private readonly attack = () => {
        // Find the closest enemy
        if (this.zombies.isEmpty) return;

        const { x, y, radius } = this.player;
        const { first } = this.zombies.sort((a, b) => a.distanceTo(this.player) - b.distanceTo(this.player));

        if (first.distanceTo(this.player) > 2 * this.travelDistance + first.radius + this.player.radius) return;

        // Determine direction
        const baseAngle = this.player.angleTo(first);

        for (let i = 0; i < this.burst; i++) {
            const angle = baseAngle + (i - (this.burst - 1) / 2) * this.spread;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            // Determine start point
            const start = {
                x: x + dx * radius,
                y: y + dy * radius,
            };

            // Determine end point
            const end = {
                x: x + dx * this.travelDistance,
                y: y + dy * this.travelDistance,
            };

            // Spawn particles
            const sprite = Sprite.from(this.particle);
            sprite.anchor.set(0.5);
            sprite.position.copyFrom(start);

            let collided = false;

            const fadeTween = gsap.to(sprite, {
                alpha: 0,
                duration: this.duration * 0.3,
                delay: this.duration * 0.7,
            });

            const tween = gsap.to(sprite, {
                x: end.x,
                y: end.y,
                duration: this.duration,
                onUpdate: () => {
                    if (this.rotation !== 0) sprite.angle += this.rotation;

                    // Check collisions
                    for (const zombie of this.zombies) {
                        const distance = zombie.distanceTo(sprite);
                        if (distance < zombie.radius + this.radius) {
                            zombie.takeDamage(this.damage);
                            collided = true;
                            sprite.destroy();
                            fadeTween.kill();
                            tween.kill();
                            break;
                        }
                    }
                },
                onComplete: () => {
                    if (collided) return;

                    sprite.destroy();
                    fadeTween.kill();
                },
            });

            this.particleSpawned.emit(sprite);
        }
    };
}
