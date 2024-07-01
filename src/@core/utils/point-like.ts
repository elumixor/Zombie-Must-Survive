export type IPoint = [number, number];
export type IPointLike = IPoint | number;

export function unwrap(point: IPointLike) {
    return typeof point === "number" ? [point, point] : point;
}
