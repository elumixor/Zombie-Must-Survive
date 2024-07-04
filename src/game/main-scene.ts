import { responsive } from "@core/responsive";
import { Container, Graphics, Ticker } from "pixi.js";
import { Player } from "./player";
import { ZombieManager } from "./zombie-manager";
import { Weapon } from "./weapon";

@responsive
export class MainScene extends Container {
    readonly playerDied;

    private readonly player = new Player();
    private readonly zombies = new ZombieManager({ player: this.player });

    @responsive({ pin: 0.5 })
    private readonly centered = new Container();
    private readonly world = new Container();

    private readonly weapon = new Weapon({
        particle: "shuriken",
        numParticles: 3,
        travelSpeed: 100,
        travelDistance: 100,
        fireRate: 0.1,
        damage: 1,
        spread: 0.3,
        burst: 3,
        radius: 5,
        rotation: 20,
    });

    constructor() {
        super();

        this.playerDied = this.player.died.pipe();

        this.centered.addChild(this.world);
        this.addChild(this.centered);

        debug.fn(() => {
            const line = this.world.addChild(new Graphics());
            const size = 500;
            line.lineStyle(10, 0xff0000).drawRect(-size / 2, -size / 2, size, size);
        });

        this.world.addChild(this.player);

        this.world.sortableChildren = true;

        // Follow the player
        Ticker.shared.add(this.followPlayer);

        // Spawn the zombies
        this.zombies.spawned.subscribe((zombie) => {
            zombie.x -= this.world.x;
            zombie.y -= this.world.y;
            this.world.addChild(zombie);
        });

        // Start attacking
        this.weapon.start();
        // Stop when player has died
        this.player.died.subscribe(() => this.weapon.stop());

        this.weapon.particleSpawned.subscribe((particle) => this.world.addChild(particle));

        this.zombies.start();
    }

    // We need to keep player at the center, by moving the world
    private readonly followPlayer = (dt: number) => {
        const { x: px, y: py } = this.player.position;
        const { x: wx, y: wy } = this.world.position;

        // Target
        const tx = -px;
        const ty = -py;

        const dx = tx - wx;
        const dy = ty - wy;
        const speed = 0.1;

        this.world.x += dx * speed * dt;
        this.world.y += dy * speed * dt;
    };
}
