import { EventEmitter } from "@elumixor/frontils";
import { ObservablePoint } from "pixi.js";

export class Camera {
    readonly updated = new EventEmitter();
    readonly position = new ObservablePoint(() => this.updated.emit(), this);
    readonly scale = new ObservablePoint(() => this.updated.emit(), this, 1, 1);

    get x() {
        return this.position.x;
    }
    set x(value: number) {
        this.position.x = value;
    }
    get y() {
        return this.position.y;
    }
    set y(value: number) {
        this.position.y = value;
    }
}
