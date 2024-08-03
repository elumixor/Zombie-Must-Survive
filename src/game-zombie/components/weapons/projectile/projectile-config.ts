import { Vec2 } from "@core";
import { Texture } from "pixi.js";

export class ProjectileConfig {
    damage;
    texture;
    movement;
    rotation;
    radius;
    distance;
    pierce;
    direction;

    constructor({
        damage = 1,
        texture = Texture.EMPTY,
        movement = new TransitionConfig(),
        rotation = undefined as TransitionConfig | undefined,
        radius = 1,
        distance = 100,
        pierce = 0,
        direction = Vec2.zero,
    } = {}) {
        this.damage = damage;
        this.texture = texture;
        this.movement = movement;
        this.rotation = rotation;
        this.radius = radius;
        this.distance = distance;
        this.pierce = pierce;
        this.direction = direction;
    }
}

export class TransitionConfig {
    startSpeed;
    acceleration;
    maxSpeed;
    minSpeed;
    drag;

    constructor({ speed = 1, acceleration = -0.1, maxSpeed = Infinity, minSpeed = 0, drag = 0.9 } = {}) {
        this.startSpeed = speed;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.minSpeed = minSpeed;
        this.drag = drag;
    }
}
