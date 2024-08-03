import { Component } from "@core";
import { EventEmitter } from "@elumixor/frontils";

export class HealthComponent extends Component {
    readonly changed = new EventEmitter<number>();
    readonly damaged = new EventEmitter<number>();
    readonly healed = new EventEmitter<number>();
    readonly died = new EventEmitter();

    maxHealth = 10;
    minHealth = 0;

    private _hp = this.maxHealth;

    get isDead() {
        return this.health <= 0;
    }

    get health() {
        return this._hp;
    }
    set health(value) {
        value = clamp(value, this.minHealth, this.maxHealth);
        if (this._hp === value) return;

        const dead = this.isDead;
        this._hp = value;

        this.changed.emit(value);

        if (this.health <= 0 && !dead) this.died.emit();
    }

    damage(damage: number) {
        this.damaged.emit(damage);
        this.health -= damage;
    }

    heal(heal: number) {
        this.healed.emit(heal);
        this.health += heal;
    }
}
