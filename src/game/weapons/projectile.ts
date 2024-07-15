import { inject } from "@core/di";
import { GameTime } from "game/game-time";
import { Container, type IPointData, Sprite } from "pixi.js";
import type { ICharacter } from "../systems/character";
import type { ITransitionConfig } from "./transition-config";

export interface IProjectileConfig {
    texture: string;
    radius: number;
    movement: ITransitionConfig;
    rotation: ITransitionConfig;
    lifetime: number;
    distance: number;
    fadeDuration: number;
    pierce?: number;
    damageInterval?: number;
}
export class Projectile extends Container {
    private readonly time = inject(GameTime);

    private speed;
    private angularSpeed;
    private distanceTraveled = 0;
    private elapsed = 0;
    private elapsedFadeOut = 0;
    private collisions = 0;

    private readonly lastDamaged = new Map<ICharacter, number>();

    constructor(
        private readonly config: IProjectileConfig & {
            damage: number;
            position: IPointData;
            direction: IPointData;
            affects: Iterable<ICharacter>;
        },
    ) {
        super();

        const sprite = Sprite.from(this.config.texture);
        this.addChild(sprite);
        sprite.anchor.set(0.5);

        this.speed = this.config.movement.speed ?? 0;
        this.angularSpeed = this.config.rotation.speed ?? 0;

        this.position.copyFrom(this.config.position);

        this.time.add(this.update);
    }

    private readonly update = (dt: number) => {
        const {
            movement,
            direction,
            rotation,
            lifetime,
            distance,
            fadeDuration,
            radius,
            damage,
            pierce = 0,
            affects,
            damageInterval = 0,
        } = this.config;

        const deltaMS = this.time.ticker.deltaMS / 1000;

        {
            const { acceleration, max, min } = rotation;

            if (acceleration) this.angularSpeed += acceleration * dt;
            if (max !== undefined) this.angularSpeed = Math.min(this.angularSpeed, max);
            if (min !== undefined) this.angularSpeed = Math.max(this.angularSpeed, min);

            this.rotation += this.angularSpeed * dt;
        }

        {
            const { acceleration, max, min } = movement;
            const { x: dx, y: dy } = direction;

            if (acceleration) this.speed += acceleration * dt;
            if (max !== undefined) this.speed = Math.min(this.speed, max);
            if (min !== undefined) this.speed = Math.max(this.speed, min);

            const s = this.speed * dt;

            this.x += dx * s;
            this.y += dy * s;

            this.distanceTraveled += s;
            this.elapsed += deltaMS;
        }

        if (this.distanceTraveled >= distance || this.elapsed >= lifetime) {
            this.elapsedFadeOut += deltaMS;
            this.alpha = clamp01((fadeDuration - this.elapsedFadeOut) / fadeDuration);

            if (this.alpha <= 0) {
                this.time.remove(this.update);
                this.destroy();
                return;
            }
        }

        // Check collisions
        if (this.collisions < pierce) {
            let collided = false;
            const now = Date.now();
            for (const affected of affects) {
                const distance = this.distanceTo(affected);

                if (distance < affected.radius + radius) {
                    const lastDamaged = this.lastDamaged.get(affected) ?? 0;
                    const elapsed = now - lastDamaged;
                    if (elapsed >= damageInterval * 1000) {
                        affected.hp -= damage;
                        this.lastDamaged.set(affected, now);
                    }

                    this.collisions++;

                    if (!collided) this.elapsed = Math.max(lifetime, this.elapsed);
                    collided = true;
                }
            }
        }

        if (this.elapsedFadeOut >= fadeDuration || this.collisions >= pierce) {
            this.time.remove(this.update);
            this.destroy();
        }
    };
}
