import { Actor } from "@core/actor";
import { inject } from "@core/di";
import { Vec2 } from "@core/extensions";
import { Time } from "@core/time";
import { Component } from "./component";
import { EventEmitter } from "@elumixor/frontils";

/**
 * Component that adds movement to the actor.
 * When assigning a target, the component will move the actor towards it.
 */
export class TrackerComponent extends Component {
    readonly forceRequested = new EventEmitter<Vec2>();
    private readonly time = inject(Time);

    /** Maximum speed that an object will be moving at */
    speed = 3;
    /** Minimum distance that should be reached */
    acceptanceDistance = 20;
    /** At this distance, the object will start to slow down to the speed 0 */
    slowdownDistance = 70;

    /** Lag in the update of the target, specified in seconds */
    lag = 0;

    /** Target to reach */
    target?: Actor;

    private elapsed = 0;

    private lastPosition = new Vec2();

    override update(dt: number) {
        super.update(dt);

        if (!this.target) return;

        this.elapsed += this.time.dMs / 1000;
        if (this.elapsed >= this.lag) {
            this.lastPosition = this.target.worldPosition;
            this.elapsed -= this.lag;
        }

        // We perform all calculations in the global frame
        const actorPos = this.actor.worldPosition;

        const direction = this.lastPosition.sub(actorPos); // from actor to target
        const distance = direction.length;

        // If we are inside slowdown distance, we should slow down
        const strength = min(
            1,
            (distance - this.acceptanceDistance) / (this.slowdownDistance - this.acceptanceDistance),
        );

        this.forceRequested.emit(direction.withLength(this.speed * strength));
    }
}
