import type { EnemyType } from "./enemy-type";

export interface IEnemyStageConfig {
    enemyType: EnemyType;
    spawnInterval: number;
    count: number;
}

export interface IStage {
    duration: number;
    enemies: IEnemyStageConfig[];
}
