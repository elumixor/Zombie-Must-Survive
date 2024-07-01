import type { ISkeletonData } from "pixi-spine";
import { Spine } from "@core/spine";
import { Pool } from "@core/pooling";
import type { SpineParameters } from "./spine-decorator";

export class SpinePool extends Pool<Spine> {
    constructor(skeleton: ISkeletonData, parameters?: SpineParameters) {
        super((pool?: Pool<Spine>) => {
            const spine = new Spine(skeleton, pool);

            if (parameters?.skin) spine.skeleton.setSkinByName(parameters.skin);

            if (parameters?.scale === undefined) spine.scale.set(1);
            else if (typeof parameters.scale === "number") spine.scale.set(parameters.scale);
            else spine.scale.set(...parameters.scale);

            return spine;
        }, parameters);
    }
}
