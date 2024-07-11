import type { WithHp } from "./hp";
import type { Container, IPointData } from "pixi.js";

export interface ICharacter extends IPointData, Container, WithHp {
    radius: number;
}
