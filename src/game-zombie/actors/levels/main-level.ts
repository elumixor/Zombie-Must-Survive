import { App, Level, Vec2 } from "@core";
import { responsive, type IResizeObservable } from "@core/responsive";
import { di } from "@elumixor/di";
import { Group } from "@pixi/layers";
import { EnemyManager, Player, XpCrystal } from "game-zombie/actors";
import { Background } from "game-zombie/background";
import { c } from "game-zombie/config";
import { GameState } from "game-zombie/game-state";
import { Clock, ControlsWidget, GameOverPopup, LevelUpPopup } from "game-zombie/ui";

@c
@responsive
export class MainLevel extends Level implements IResizeObservable {
    private readonly app = di.inject(App);
    private readonly gameState = new GameState();
    private readonly background = this.addChild(new Background());
    private readonly player = this.addChild(new Player());

    readonly enemyManager = this.addChild(new EnemyManager());

    @responsive({ pin: [0.5, 0], y: 30 })
    private readonly clock = this.ui.addChild(new Clock());

    private readonly mobileControls = this.app.isMobile ? this.ui.addChild(new ControlsWidget()) : undefined;
    private readonly gameOverPopup = this.ui.addChild(new GameOverPopup());
    private readonly levelUpPopup = this.ui.addChild(new LevelUpPopup());

    @c(c.num({ step: 1 }), { tabGroup: "Player" })
    private readonly startingXPCrystals = 20;

    constructor() {
        super();

        // Create some layers
        this.layers.add("foreground", new Group(1, (sprite) => (sprite.zOrder = +sprite.y)));
        this.layers.add("projectiles", new Group(2, (sprite) => (sprite.zOrder = +sprite.y)));
        this.layers.add("overlay", new Group(3));
        this.layers.add("playerUI", new Group(4));
        this.layers.add("ui", new Group(5));
        this.layers.add("popup", new Group(6));

        this.enemyManager.enemiesTarget = this.player;

        this.player.died.subscribe(() => this.onPlayerDied());

        this.gameState.player.levelUp.subscribe(async () => {
            this.time.paused = true;
            const skill = await this.levelUpPopup.show();
            skill.applyTo(this.player);
            skill.level++;
            this.time.paused = false;
        });
    }

    override beginPlay() {
        super.beginPlay();
        // Spawn some random crystals...?
        for (const x of range(this.startingXPCrystals)) {
            const c = new XpCrystal();
            c.position = Vec2.random().withLength(random(300, 300 + 25 * x));
            this.addChild(c);
        }
    }

    private async onPlayerDied() {
        logs("Player died", { color: "red" });
        this.time.paused = true;
        await this.gameOverPopup.show();
        this.reset();
        await this.gameOverPopup.hide();
        this.time.paused = false;
    }

    private reset() {
        di.uninject(GameState);
        this.destroy();
        this.gameState.destroy();
        this.time.reset();
        void this.game.changeLevel(new MainLevel());
    }
}
