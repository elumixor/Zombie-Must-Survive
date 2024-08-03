import type { Actor } from "../actor";

/** Components add functionality to {@link Actor}s. They do not have {@link tickEnabled} by default. */
export class Component {
    /** Whether the component should be updated every frame */
    tickEnabled = true;

    constructor(readonly actor: Actor) {}

    protected get level() {
        return this.actor.level;
    }

    /** Called every frame if {@link tickEnabled} is set to `true` */
    update(_dt: number) {
        return;
    }

    beginPlay() {
        return;
    }

    destroy() {
        return;
    }
}
