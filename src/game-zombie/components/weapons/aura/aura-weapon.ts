import { WeaponComponent } from "../weapon";
import { AuraCloudActor } from "./aura-cloud";

export class AuraWeaponComponent extends WeaponComponent {
    radius = 100;
    override attackWithTargetInRange = false;

    protected override use() {
        const auraCloud = new AuraCloudActor(this.radius, this.damage, this.tags, this.carrierVelocity);
        this.level.addChild(auraCloud);
        auraCloud.worldPosition = this.actor.worldPosition;
    }
}
