import { responsive } from "@core/responsive";
import { Container } from "pixi.js";
import { EnemyManager } from "./enemies/enemy-manager";
import { Player } from "./player/player";
// import { Crystal } from "./crystal";
// import { gsap } from "gsap";
import { PlayerUI } from "./ui/player-ui";
import { World } from "./world";
import { RangedAttack } from "./weapons";

@responsive
export class MainScene extends Container {
    readonly playerDied;

    @responsive({ pin: 0.5 })
    private readonly world = new World();

    private readonly player = new Player();
    private readonly zombieManager = new EnemyManager();

    private readonly playerUI = new PlayerUI();

    constructor() {
        super();

        this.playerDied = this.player.died.pipe();

        this.addChild(this.world, this.playerUI);

        this.player.weapon = new RangedAttack({
            projectile: {
                texture: "shuriken",
                radius: 5,
                movement: {
                    speed: 10,
                    acceleration: -0.3,
                    max: 10,
                    min: 0,
                },
                rotation: {
                    speed: 0,
                    acceleration: 2,
                    max: 5,
                },
                distance: 100,
                lifetime: 1,
                fadeDuration: 0.3,
                fadeDeadly: true,
                destroyOnCollision: false,
                damageInterval: 0.2,
            },
            range: 300,
            carrier: this.player,
            targetType: "enemy",
            damage: 1,
            numProjectiles: 3,
            rate: 0.3,
            spread: 30,
        });

        // Spawn crystals on zombie death
        // this.zombieManager.enemyDied.subscribe((zombie) => {

        // });

        // Start weapon
        // this.weapon.particleSpawned.subscribe((particle) => this.foreground.addChild(particle));

        // Player events
        // this.player.hpChanged.subscribe((damage) => (this.playerUI.hp -= damage));
        // this.player.died.subscribe(() => {
        //     this.weapon.stop();
        //     this.zombieManager.stop();

        //     Ticker.shared.remove(this.followPlayer);
        //     gsap.to(this.centered.scale, { x: 2, y: 2, duration: 5, ease: "expo.out" });
        // });
    }

    restart() {
        this.world.reset();
        this.player.reset();

        this.world.spawn(this.player, { tag: "player" });
        this.world.track(this.player, true);

        this.playerUI.hidden = false;
        this.player.appear();

        this.zombieManager.restart();

        // this.weapon.start();
    }
}
