import { Vec2 } from "@core";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";

export interface Subscription {
    unsubscribe: () => void;
}

@di.injectable
export class Controls {
    readonly movementChanged = new EventEmitter<Vec2>();

    private readonly movementDiff = new EventEmitter<Vec2>();
    private readonly _currentSpeed = new Vec2();

    constructor() {
        // Add event listeners and map them to events
        this.disabled = false;

        this.movementDiff.subscribe((diff) => {
            this._currentSpeed.copyFrom(this._currentSpeed.add(diff).sign);
            this.movementChanged.emit(this._currentSpeed);
        });

        window.addEventListener("blur", () => {
            this._currentSpeed.zero();
            this.movementChanged.emit(this._currentSpeed);
        });
    }

    set disabled(value: boolean) {
        if (value) {
            logs("Controls disabled");
            window.removeEventListener("keydownonce", this.onKeyDown);
            window.removeEventListener("keyup", this.onKeyUp);
        } else {
            logs("Controls enabled");
            window.addEventListener("keydownonce", this.onKeyDown);
            window.addEventListener("keyup", this.onKeyUp);
        }
    }

    get currentSpeed() {
        return this._currentSpeed;
    }

    move(dx: number, dy: number) {
        this._currentSpeed.x = dx;
        this._currentSpeed.y = dy;
        this.movementChanged.emit(this._currentSpeed);
    }

    private readonly onKeyDown = (e: Event) => {
        switch ((e as KeyboardEvent).code) {
            case "ArrowUp":
            case "KeyW":
                this.movementDiff.emit(Vec2.up);
                break;
            case "ArrowDown":
            case "KeyS":
                this.movementDiff.emit(Vec2.down);
                break;
            case "ArrowLeft":
            case "KeyA":
                this.movementDiff.emit(Vec2.left);
                break;
            case "ArrowRight":
            case "KeyD":
                this.movementDiff.emit(Vec2.right);
                break;
            default:
                break;
        }
    };

    private readonly onKeyUp = (e: KeyboardEvent) => {
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                this.movementDiff.emit(Vec2.down);
                break;
            case "ArrowDown":
            case "KeyS":
                this.movementDiff.emit(Vec2.up);
                break;
            case "ArrowLeft":
            case "KeyA":
                this.movementDiff.emit(Vec2.right);
                break;
            case "ArrowRight":
            case "KeyD":
                this.movementDiff.emit(Vec2.left);
                break;
            default:
                break;
        }
    };
}
