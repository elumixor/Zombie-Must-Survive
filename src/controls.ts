import { injectable } from "@core/di";
import type { IPoint } from "@core/utils";
import { EventEmitter } from "@elumixor/frontils";
import { Ticker } from "pixi.js";

@injectable
export class Controls {
    readonly movementChanged = new EventEmitter<IPoint>();

    private readonly movementDiff = new EventEmitter<IPoint>();
    private readonly _currentSpeed = [0, 0] as IPoint;

    constructor() {
        // Add event listeners and map them to events
        this.disabled = false;

        this.movementDiff.subscribe(([dx, dy]) => {
            const [x, y] = this._currentSpeed;

            this._currentSpeed[0] = Math.sign(x + dx);
            this._currentSpeed[1] = Math.sign(y + dy);

            this.movementChanged.emit([...this._currentSpeed]);
        });
    }

    set disabled(value: boolean) {
        if (value) {
            window.removeEventListener("keydownonce", this.onKeyDown);
            window.removeEventListener("keyup", this.onKeyUp);
        } else {
            debug("Adding event listeners...");
            window.addEventListener("keydownonce", this.onKeyDown);
            window.addEventListener("keyup", this.onKeyUp);
        }
    }

    onMove(callback: (dx: number, dy: number, dt: number) => void) {
        const cb = (dt: number) => callback(...this._currentSpeed, dt);
        let subscribed = false;

        this.movementChanged.subscribe(([dx, dy]) => {
            if (dx === 0 && dy === 0) {
                Ticker.shared.remove(cb);
                subscribed = false;
            } else if (!subscribed) {
                Ticker.shared.add(cb);
                subscribed = true;
            }
        });
    }

    get currentSpeed() {
        return [...this._currentSpeed];
    }

    private readonly onKeyDown = (e: Event) => {
        switch ((e as KeyboardEvent).code) {
            case "ArrowUp":
            case "KeyW":
                this.movementDiff.emit([0, -1]);
                break;
            case "ArrowDown":
            case "KeyS":
                this.movementDiff.emit([0, 1]);
                break;
            case "ArrowLeft":
            case "KeyA":
                this.movementDiff.emit([-1, 0]);
                break;
            case "ArrowRight":
            case "KeyD":
                this.movementDiff.emit([1, 0]);
                break;
            default:
                break;
        }
    };

    private readonly onKeyUp = (e: KeyboardEvent) => {
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                this.movementDiff.emit([0, 1]);
                break;
            case "ArrowDown":
            case "KeyS":
                this.movementDiff.emit([0, -1]);
                break;
            case "ArrowLeft":
            case "KeyA":
                this.movementDiff.emit([1, 0]);
                break;
            case "ArrowRight":
            case "KeyD":
                this.movementDiff.emit([-1, 0]);
                break;
            default:
                break;
        }
    };
}
