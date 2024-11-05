import { vec2 } from "@core";
import { Enemy } from "game-zombie/actors";
import { PeriodicSkillComponent } from "../periodic-skill-component";
import { AcidPoolActor } from "./acid-pool-actor";

export class AcidPoolComponent extends PeriodicSkillComponent {
    damage = 1;
    damageRate = 1;
    lifetime = 1;
    radius = 1;
    spawnCooldown = 1;
    range = 1;
    travelDuration = 0.5;

    protected override activate() {
        const poolActor = new AcidPoolActor();

        poolActor.lifetime = this.lifetime;
        poolActor.damage = this.damage;
        poolActor.damageRate = this.damageRate;
        poolActor.radius = this.radius;
        poolActor.travelDuration = this.travelDuration;

        this.level.addChild(poolActor);

        // Get all enemies in the level that are in range
        const enemies = this.level.getActorsOfType(Enemy).filter((enemy) => enemy.distanceTo(this.actor) <= this.range);
        let spawnPosition;

        // Set random position if there are no enemies
        if (enemies.isEmpty) {
            spawnPosition = this.actor.worldPosition.add(vec2.random.withLength(random(0.5 * this.range, this.range)));
        } else {
            // Otherwise, set the position to the enemy with the most enemies around
            const enemiesAround = enemies.map((enemy) => this.enemiesAround(enemy, enemies));
            const enemyIndex = enemiesAround.map((group) => group.length).argmax;
            const enemy = enemies[enemyIndex];
            spawnPosition = enemy.position;
        }

        poolActor.targetPoint = spawnPosition;
        poolActor.worldPosition = this.actor.worldPosition;

        void poolActor.startAnimation();
    }

    private enemiesAround(enemy: Enemy, enemies: Enemy[]) {
        return enemies.filter((other) => other.distanceTo(enemy) <= this.radius);
    }
}
