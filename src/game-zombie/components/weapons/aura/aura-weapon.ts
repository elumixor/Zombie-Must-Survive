import { WeaponComponent } from "../weapon";
import { AuraCloudActor } from "./aura-cloud";

export class AuraWeaponComponent extends WeaponComponent {
    color = "green";
    radius = 100;
    attackWithTargetInRange = false;

    protected override use() {
        const auraCloud = new AuraCloudActor(this.radius, this.color, this.damage, this.tags, this.carrierVelocity);
        this.level.addChild(auraCloud);
        auraCloud.worldPosition = this.actor.worldPosition;
    }
}
