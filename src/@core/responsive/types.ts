import type { IPointLike } from "@core/utils";
import type { DefaultMap } from "@elumixor/frontils";

export const metadataKey = Symbol("responsiveMetadata");
export const observableProxies = Symbol("observableProxies");

export type OrientationMap = DefaultMap<Orientation, Map<string, IElementConfig>>;

export type Orientation = "portrait" | "landscape" | "desktop" | "desktopNarrow";

export type ResizeType = "static" | "dynamic";

export interface IElementConfig {
    pin?: IPointLike;
    anchor?: IPointLike;
    scale?: IPointLike;
    angle?: number;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    fitTo?: number | [number, number] | [number, number, { keepX?: true; keepY?: true }];
    uniformWidth?: number;
    uniformHeight?: number;
    resizeInvisible?: boolean;
    useClientScale?: boolean;
}

// type ScaleConfig = Partial<
// { useClientScale: true; useUnsafeHeight: never } | { useUnsafeHeight: false; useClientScale: never }
// >;

// export type IElementConfig = IConfig & ScaleConfig;

// To check correctness:
// const a: ScaleConfig = {};
// const b: ScaleConfig = { useClientScale: true };
// const c: ScaleConfig = { useSafeHeight: true };
// const d: ScaleConfig = { useClientScale: true, useSafeHeight: true }; // <- should be an error
