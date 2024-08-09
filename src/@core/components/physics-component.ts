import { Vec2 } from "@core/extensions";
import { Component } from "./component";
import { di } from "@elumixor/di";
import { Time } from "@core/time";

export class PhysicsComponent extends Component {
    private readonly time = di.inject(Time);

    mass = 1;
    drag = 0.9;
    minSpeed = 0;
    maxSpeed = Infinity;

    private _velocity = Vec2.zero;
    private _acceleration = Vec2.zero;

    get velocity() {
        return this._velocity;
    }

    get acceleration() {
        return this._acceleration;
    }

    addForce(force: Vec2) {
        this._acceleration = force.div(this.mass);
        this._velocity.iadd(this._acceleration.mul(this.time.dt));
    }

    addVelocity(velocity: Vec2) {
        this._velocity.iadd(velocity);
    }

    override update(dt: number) {
        this._velocity.imul(this.drag);
        this._velocity.clip(this.minSpeed, this.maxSpeed);
        this.actor.position.iadd(this._velocity.mul(dt));
    }
}
