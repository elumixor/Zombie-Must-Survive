import { c, numProp } from "game-zombie/config";
import type { Skill } from "./skill";

export const cskill: PropertyDecorator = (target, propertyKey) => {
    c(numProp(), {
        section: "Skills",
        onUpdate(instances) {
            for (const instance of instances) {
                const skill = instance as Skill;
                skill.update(skill.actor!, skill.level);
            }
        },
    })(target, propertyKey);
};
