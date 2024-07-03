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
        window.addEventListener("keydownonce", (event) => {
            switch ((event as KeyboardEvent).key) {
                case "ArrowUp":
                case "w":
                    this.movementDiff.emit([0, -1]);
                    break;
                case "ArrowDown":
                case "s":
                    this.movementDiff.emit([0, 1]);
                    break;
                case "ArrowLeft":
                case "a":
                    this.movementDiff.emit([-1, 0]);
                    break;
                case "ArrowRight":
                case "d":
                    this.movementDiff.emit([1, 0]);
                    break;
                default:
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "w":
                    this.movementDiff.emit([0, 1]);
                    break;
                case "ArrowDown":
                case "s":
                    this.movementDiff.emit([0, -1]);
                    break;
                case "ArrowLeft":
                case "a":
                    this.movementDiff.emit([1, 0]);
                    break;
                case "ArrowRight":
                case "d":
                    this.movementDiff.emit([-1, 0]);
                    break;
                default:
                    break;
            }
        });

        this.movementDiff.subscribe(([dx, dy]) => {
            const [x, y] = this._currentSpeed;

            this._currentSpeed[0] = Math.sign(x + dx);
            this._currentSpeed[1] = Math.sign(y + dy);

            this.movementChanged.emit([...this._currentSpeed]);
        });
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
}
