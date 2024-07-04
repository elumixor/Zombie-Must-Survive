import { Container, Ticker } from "pixi.js";
import { Zombie } from "./zombie";
import { EventEmitter } from "@elumixor/frontils";
import type { Player } from "./player";
import { inject } from "@core/di";
import { Resizer } from "@core/responsive/resizer";
import { Interval } from "./interval";

export class ZombieManager extends Container {
    readonly spawned = new EventEmitter<Zombie>();

    spawnInterval;
    maxZombies;
    minZombies;
    zombieMass;

    private readonly resizer = inject(Resizer);

    private readonly spawner;
    private readonly player;

    private zombies = [] as Zombie[];

    attraction = 1;
    repulsion = 0.5;
    friction = 0.5;

    constructor({
        spawnInterval = 0.3,
        maxZombies = 100,
        minZombies = 3,
        zombieMass = 10,
        player,
    }: {
        spawnInterval?: number;
        maxZombies?: number;
        minZombies?: number;
        zombieMass?: number;
        player: Player;
    }) {
        super();

        this.spawnInterval = spawnInterval;
        this.maxZombies = maxZombies;
        this.minZombies = minZombies;
        this.zombieMass = zombieMass;
        this.player = player;

        this.spawner = new Interval(() => this.spawn(), this.spawnInterval);

        Ticker.shared.add(this.move);
    }

    start() {
        this.spawner.start();
    }

    stop() {
        this.spawner.pause();
    }

    pause() {
        this.spawner.pause();
    }

    private spawn() {
        if (this.zombies.length >= this.maxZombies) return;

        // Spawn a zombie
        const zombie = new Zombie(this.zombieMass);

        // Position it outside the screen
        const r = Math.random();
        const vertical = r > 0.5;
        let { width, height } = this.resizer.dimensions;

        // Increase a bit so that they are really off-screen
        width *= 1.2;
        height *= 1.2;

        if (vertical) {
            zombie.y = (Math.sign(r - 0.75) * height) / 2;
            zombie.x = (Math.random() - 0.5) * width;
        } else {
            zombie.x = (Math.sign(r - 0.25) * width) / 2;
            zombie.y = (Math.random() - 0.5) * height;
        }

        this.zombies.push(zombie);
        this.spawned.emit(zombie);

        zombie.died.subscribe(() => {
            this.zombies.remove(zombie);
            if (this.zombies.length < this.minZombies) this.spawn();
        });
    }

    // Boids-like movement
    private readonly move = (dt: number) => {
        for (const zombie of this.zombies) {
            const force = { x: 0, y: 0 };

            // Attraction to the player
            const dx = this.player.x - zombie.x;
            const dy = this.player.y - zombie.y;

            const angle = Math.atan2(dy, dx);

            force.x += Math.cos(angle) * this.attraction;
            force.y += Math.sin(angle) * this.attraction;

            // Repulsion from other zombies
            for (const other of this.zombies) {
                if (other === zombie) continue;

                const dx = other.x - zombie.x;
                const dy = other.y - zombie.y;

                const distance = Math.hypot(dx, dy);

                if (distance > 100) continue;

                const angle = Math.atan2(dy, dx);

                let repulsion = -this.repulsion * Math.log(distance / 100);
                repulsion = Math.max(0, Math.min(10, repulsion));

                force.x -= Math.cos(angle) * repulsion;
                force.y -= Math.sin(angle) * repulsion;
            }

            // Friction
            force.x -= zombie.speed.x * this.friction;
            force.y -= zombie.speed.y * this.friction;

            // Update
            zombie.update(force, dt);

            // Check distance from the player
            const dpx = this.player.x - zombie.x;
            const dpy = this.player.y - zombie.y;
            const distance = Math.hypot(dpx, dpy);

            if (distance < this.player.collisionDistance) {
                const angle = Math.atan2(dpy, dpx);
                zombie.x = this.player.x - Math.cos(angle) * this.player.collisionDistance;
                zombie.y = this.player.y - Math.sin(angle) * this.player.collisionDistance;
            }

            // Check Z index
            zombie.zIndex = zombie.y > this.player.y ? 1 : -1;
        }
    };
}
