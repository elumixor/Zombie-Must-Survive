import { inject } from "@core/di";
import { GameTime } from "game/game-time";
import { Container, type IPointData, Sprite } from "pixi.js";
import type { ICharacter } from "../systems/character";
import type { ITransitionConfig } from "./transition-config";
import { clamp01 } from "@core/utils";
export interface IProjectileConfig {
    texture: string;
    radius: number;
    movement: ITransitionConfig;
    rotation: ITransitionConfig;
    lifetime: number;
    distance: number;
    fadeDuration: number;
    fadeDeadly?: true;
    destroyOnCollision?: false;
    damageInterval?: number;
}
export class Projectile extends Container {
    private readonly time = inject(GameTime);

    private speed;
    private angularSpeed;
    private distanceTraveled = 0;
    private elapsed = 0;
    private elapsedFadeOut = 0;
    private potent = true;

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
            fadeDeadly = false,
            destroyOnCollision = true,
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
        }

        // Check collisions
        if (this.potent) {
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

                    if (destroyOnCollision) {
                        this.time.remove(this.update);
                        this.destroy();
                        return;
                    }

                    if (!collided) {
                        if (fadeDeadly) this.elapsed = Math.max(lifetime, this.elapsed);
                        else this.potent = false;
                    }

                    collided = true;
                }
            }
        }

        if (this.elapsedFadeOut >= fadeDuration) {
            this.time.remove(this.update);
            this.destroy();
        }
    };
}
