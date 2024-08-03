import { Actor, injectable } from "@core";
import { WorldBackground } from "../../background";
import { SortableActor } from "./sortable-actor";

@injectable
export class World extends Actor {
    readonly followParameters = { maxDistance: 50, maxScale: 1.3, followSpeed: 0.1 };

    /**
     * Background, that will stay in place but scroll infinitely.
     * With this trick, we can have a single object, but create an illusion of infinite map
     */
    private readonly background = new WorldBackground();

    /** Foreground, that will contain all our objects, just a container */
    private readonly foreground = new SortableActor();

    /** We store the player to track its movement */
    private playerActor?: Actor;

    constructor() {
        super();

        this.addComponent(this.background);

        // Add foreground through non-overridden super method
        // to allow convenient actor forwarding to `foreground` on addition (see `addActor` override)
        super.addActor(this.foreground);

        this.name = "World";
        this.foreground.name = "Foreground";
        this.background.name = "Background";
    }

    track(playerActor: Actor, instantly?: true) {
        this.playerActor = playerActor;
        this.tickEnabled = true;

        if (instantly) {
            const { x, y } = playerActor;
            this.foreground.position.set(-x, -y);
            this.background.tilePosition.set(-x, -y);
        }
    }

    stopTracking() {
        this.tickEnabled = false;
        this.playerActor = undefined;
    }

    override addActor<T extends Actor>(actor: T, { relativeTo = "world" }: { relativeTo?: "world" | "player" } = {}) {
        this.foreground.addActor(actor);

        if (relativeTo === "player") {
            actor.x -= this.foreground.x;
            actor.y -= this.foreground.y;
        }

        return actor;
    }

    reset() {
        this.foreground.position.set(0);
        this.background.tilePosition.set(0);
        this.scale.set(1);
    }

    protected override beginPlay() {
        if (!this.playerActor) this.tickEnabled = false;
    }

    // We need to keep player at the center, by moving the world
    protected override update(dt: number) {
        if (!this.playerActor) return;

        const { x: px, y: py } = this.playerActor;
        const { x: wx, y: wy } = this.foreground;
        const { maxDistance, maxScale, followSpeed } = this.followParameters;

        // Target
        const tx = -px;
        const ty = -py;

        const dx = tx - wx;
        const dy = ty - wy;

        this.foreground.x += dx * followSpeed * dt;
        this.foreground.y += dy * followSpeed * dt;

        // Based on the distance, we should also slowly interpolate the zoom value
        // if the distance is 0, then scale should be MAX_SCALE
        // If the distance is MAX_DISTANCE, then scale should be 1
        const distance = min(hypot(dx, dy), maxDistance);
        const targetScale = 1 + (maxScale - 1) * (1 - distance / maxDistance);
        const diff = targetScale - this.scale.x;

        this.scale.x += diff * followSpeed * dt;
        this.scale.y += diff * followSpeed * dt;

        this.background.tilePosition.x = this.foreground.x;
        this.background.tilePosition.y = this.foreground.y;
    }
}
