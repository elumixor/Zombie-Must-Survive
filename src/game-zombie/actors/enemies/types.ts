import type { EnemySpineKey } from "game-zombie/resources-zombie";

export interface IEnemyStageConfig {
    enemyType: string;
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
    spine: EnemySpineKey;
}
