import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Container, Ticker, TilingSprite } from "pixi.js";
import { Player } from "./player";
import { Weapon } from "./weapon";
import { ZombieManager } from "./zombie-manager";
import { Crystal } from "./crystal";
import { gsap } from "gsap";
import { PlayerUI } from "./player-ui";

@responsive
export class MainScene extends Container implements IResizeObservable {
    readonly playerDied;

    private readonly player = new Player();
    private readonly zombieManager = new ZombieManager();

    @responsive({ pin: 0.5 })
    private readonly centered = new Container();
    private readonly world = new Container();
    private readonly background = TilingSprite.from("background", { width: 500, height: 500 });
    private readonly foreground = new Container();

    private readonly playerUI = new PlayerUI();

    private readonly weapon = new Weapon({
        particle: "shuriken",
        numParticles: 3,
        travelSpeed: 300,
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
        this.player.health = this.playerUI.health;
        this.playerUI.healthChanged.subscribe((health) => (this.player.health = health));

        this.addChild(this.centered, this.playerUI);
        this.centered.addChild(this.background, this.world);
        this.world.addChild(this.foreground);

        this.background.anchor.set(0.5);

        this.foreground.addChild(this.player);
        this.foreground.sortableChildren = true;

        // Follow the player
        Ticker.shared.add(this.followPlayer);

        // Spawn the zombies
        this.zombieManager.zombieSpawned.subscribe((zombie) => {
            zombie.x -= this.world.x;
            zombie.y -= this.world.y;
            this.foreground.addChild(zombie);
        });
        // Spawn crystals on zombie death
        this.zombieManager.zombieDied.subscribe((zombie) => {
            const crystal = new Crystal();
            crystal.zIndex = -10;
            crystal.position.copyFrom(zombie);
            this.foreground.addChild(crystal);

            crystal.collected.subscribe(() => (this.playerUI.experience += crystal.xp));
        });

        // Start weapon
        this.weapon.particleSpawned.subscribe((particle) => this.foreground.addChild(particle));

        // Player events
        this.player.damaged.subscribe((damage) => (this.playerUI.health -= damage));
        this.player.died.subscribe(() => {
            this.weapon.stop();
            this.zombieManager.stop();

            Ticker.shared.remove(this.followPlayer);
            gsap.to(this.centered.scale, { x: 2, y: 2, duration: 5, ease: "expo.out" });
        });
    }

    restart() {
        this.player.position.set(0);
        this.world.position.set(0);
        this.background.tilePosition.set(0);
        this.foreground.removeChildren();
        this.foreground.addChild(this.player);

        this.playerUI.reset();
        this.player.reset();
        this.zombieManager.restart();
        this.weapon.start();

        Ticker.shared.add(this.followPlayer);
    }

    resize({ width, height }: IDimensions) {
        this.background.width = width;
        this.background.height = height;
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

        const value = Math.hypot(dx, dy);
        this.centered.scale.set(1.1 - value / 1000);

        this.background.tilePosition.x = this.world.x;
        this.background.tilePosition.y = this.world.y;
    };
}
