import { responsive } from "@core/responsive";
import { Container } from "pixi.js";
import { EnemyManager } from "./enemies/enemy-manager";
import { Player } from "./player/player";
import { PlayerUI } from "./ui/player-ui";
import { World } from "./world";
import { inject } from "@core/di";
import { GameTime } from "./game-time";
import { SkillPool } from "./skills";
import { Interval } from "./interval";

@responsive
export class MainScene extends Container {
    private readonly time = inject(GameTime);

    readonly playerDied;
    readonly stageCompleted;

    private readonly skillPool = new SkillPool();

    @responsive({ pin: 0.5 })
    private readonly world = new World();
    private readonly player = new Player();
    private readonly enemyManager = new EnemyManager([
        {
            duration: 15,
            enemies: [{ enemyType: "worker", spawnInterval: 1, count: 5 }],
        },
        {
            duration: 15,
            enemies: [
                { enemyType: "worker", spawnInterval: 1, count: 5 },
                { enemyType: "soldier", spawnInterval: 2, count: 3 },
            ],
        },
    ]);

    private readonly playerUI = new PlayerUI();

    private readonly interval = new Interval(() => {
        this.elapsed++;
        this.playerUI.gameTime = this.elapsed;
    }, 1);

    private elapsed = 0;

    constructor() {
        super();

        this.playerDied = this.player.died.pipe();
        this.stageCompleted = this.enemyManager.stageCompleted.pipe();

        this.addChild(this.world, this.playerUI);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.player.levelUp.subscribe(async () => {
            this.time.paused = true;
            const skill = await this.playerUI.showLevelUp();
            this.skillPool.learn(skill, this.player);
            this.time.paused = false;
        });
    }

    restart() {
        this.interval.start();
        this.elapsed = 0;
        this.playerUI.gameTime = 0;

        this.world.reset();
        this.player.reset();

        this.skillPool.reset();
        this.skillPool.auraSkill.applyTo(this.player);

        this.world.spawn(this.player, { tag: "player" });
        this.world.track(this.player, true);

        this.playerUI.hidden = false;
        this.player.appear();

        this.enemyManager.restart();
    }
}
