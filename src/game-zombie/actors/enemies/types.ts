import type { EnemyType } from "./enemy-type";

export interface IEnemyStageConfig {
    enemyType: EnemyType;
    spawnInterval: number;
    count: number;
}

export interface IStageConfig {
    duration: number;
    enemies: IEnemyStageConfig[];
}

export interface IEnemyConfig {
    speed: number;
    damage: number;
    health: number;
    lag: number;
}
