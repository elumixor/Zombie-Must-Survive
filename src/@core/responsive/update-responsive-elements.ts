import { Container, type Point } from "pixi.js";
import { type IElementConfig, type OrientationMap, metadataKey } from "./types";
import type { IDimensions } from "./resizer";
import { unwrap } from "@core/utils";

interface IResponsiveTarget {
    x?: number;
    y?: number;
    angle?: number;
    scale?: Point;
    width?: number;
    height?: number;
    uniformWidth?: number;
    uniformHeight?: number;
    fitTo?: Container["fitTo"];
    anchor?: Point;
}

export function updateResponsiveElements(instance: object, dimensions: IDimensions, resizeStatic = false) {
    const metadata = Reflect.getMetadata(metadataKey, instance) as OrientationMap | undefined;
    if (!metadata) return;

    const orientationMetadata = metadata.get(dimensions.orientation);

    for (const [propertyKey, config] of orientationMetadata.entries()) {
        const element = Reflect.get(instance, propertyKey) as IResponsiveTarget | undefined;
        updateResponsiveElement(element, config, dimensions, resizeStatic);
    }
}

export function updateResponsiveElement(
    element: IResponsiveTarget | undefined,
    config: IElementConfig,
    dimensions: IDimensions,
    resizeStatic: boolean,
) {
    if (!element || !(config.resizeInvisible ?? true) || isStatic(config) !== resizeStatic) return;

    const {
        scale,
        width,
        uniformWidth,
        height,
        uniformHeight,
        fitTo,
        angle,
        x,
        y,
        pin,
        useClientScale = false,
        // useUnsafeHeight = true,
        anchor,
    } = config;

    if (anchor !== undefined) element.anchor?.set(...unwrap(anchor));
    if (angle !== undefined) element.angle = angle;
    if (scale !== undefined) element.scale?.set(...unwrap(scale));
    if (width) element.width = width;
    if (height) element.height = height;
    if (uniformWidth) element.uniformWidth = uniformWidth;
    if (uniformHeight) element.uniformHeight = uniformHeight;
    if (fitTo) {
        if (typeof fitTo === "number") element.fitTo?.(fitTo);
        else element.fitTo?.(...(fitTo as Parameters<Container["fitTo"]>)); // Idk why, but this assertion is needed
    }
    if (pin !== undefined || x !== undefined)
        element.x = (useClientScale ? dimensions.clientWidth : dimensions.width) * unwrap(pin ?? 0).first + (x ?? 0);
    if (pin !== undefined || y !== undefined)
        element.y = (useClientScale ? dimensions.clientHeight : dimensions.height) * unwrap(pin ?? 0).second + (y ?? 0);
}

export function isStatic({ pin }: IElementConfig) {
    if (pin === undefined || pin === 0) return true;
    if (typeof pin === "number") return false;
    return pin[0] === 0 && pin[1] === 0;
}
