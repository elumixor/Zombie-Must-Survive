import { Time, type Timeout, type Interval } from "@core";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";
import type { IEnemyStageConfig, IStageConfig } from "./types";

export class Stage {
    readonly ended = new EventEmitter();
    readonly spawnRequested = new EventEmitter<IEnemyStageConfig>();

    private readonly time = di.inject(Time);
    private timeout?: Timeout;
    private intervals = [] as Interval[];

    constructor(
        public stageConfig: IStageConfig = {
            duration: 1,
            enemies: [],
        },
    ) {}

    start() {
        this.stop();

        this.timeout = this.time.timeout(() => this.end(), this.stageConfig.duration);
        this.intervals = this.stageConfig.enemies.map((enemy) =>
            this.time.interval(() => this.spawnRequested.emit(enemy), enemy.spawnInterval, true),
        );
    }

    stop() {
        this.timeout?.clear();
        for (const interval of this.intervals) interval.clear();

        this.timeout = undefined;
        this.intervals = [];
    }

    private end() {
        this.stop();
        this.ended.emit();
    }
}
