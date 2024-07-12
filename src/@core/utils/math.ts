export function lerp(p: number, from: number, to: number) {
    return from + (to - from) * p;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number) {
    return clamp(value, 0, 1);
}
