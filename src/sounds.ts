import { injectable } from "@core/di";
import { BaseSounds, Sound } from "@core/sounds";

@injectable
export class Sounds extends BaseSounds {
    readonly sound = new Sound("win", { volume: 0.5 });
}
