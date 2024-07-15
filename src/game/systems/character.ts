import type { WithHp } from "./hp";
import type { ICircleContainer } from "game/circle-container";

export interface ICharacter extends ICircleContainer, WithHp {}
