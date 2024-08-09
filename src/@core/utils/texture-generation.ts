import { App } from "@core/app";
import { di } from "@elumixor/di";
import type { ColorSource, IRenderer } from "pixi.js";
import { Graphics, SCALE_MODES, Sprite } from "pixi.js";

function getResolution() {
    return di.inject(App).resolution;
}

let renderer: IRenderer | undefined;
function r() {
    if (!renderer) renderer = di.inject(App).renderer;
    return renderer;
}

export function generateTexture(
    graphics: Graphics,
    { scaleMode = SCALE_MODES.LINEAR, resolution = getResolution() } = {},
) {
    resolution = Math.max(1, Math.floor(resolution));

    return r().generateTexture(graphics, { scaleMode, resolution });
}

export function rectGraphics({ width = 2, height = 2, color = 0 as ColorSource, alpha = 1, roundedRadius = 0 } = {}) {
    const graphics = new Graphics();
    graphics.beginFill(color, alpha);
    if (roundedRadius) graphics.drawRoundedRect(0, 0, width, height, roundedRadius);
    else graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    return graphics;
}

export function rectTexture({
    width = 2,
    height = 2,
    color = 0 as ColorSource,
    alpha = 1,
    roundedRadius = 0,
    resolution = getResolution(),
} = {}) {
    return generateTexture(rectGraphics({ width, height, color, alpha, roundedRadius }), { resolution });
}

export function ellipseTexture(
    width: number,
    height: number,
    { color = 0 as ColorSource, alpha = 1, resolution = getResolution() } = {},
) {
    const graphics = new Graphics();
    graphics.beginFill(color, alpha);
    graphics.drawEllipse(width / 2, height / 2, width, height);
    graphics.endFill();
    return generateTexture(graphics, { resolution });
}

export function circleTexture({ radius = 50, color = 0 as ColorSource, alpha = 1, resolution = getResolution() } = {}) {
    return ellipseTexture(radius * 2, radius * 2, { color, alpha, resolution });
}

export function rectSprite({
    width = 2,
    height = 2,
    color = 0 as ColorSource,
    alpha = 1,
    roundedRadius = 0,
    resolution = getResolution(),
} = {}) {
    const [w, h] = roundedRadius === 0 ? [2, 2] : [width, height];
    const sprite = new Sprite(rectTexture({ width: w, height: h, color, alpha, roundedRadius, resolution }));
    sprite.width = width;
    sprite.height = height;
    return sprite;
}

export function circleSprite({ radius = 50, color = 0 as ColorSource, alpha = 1, resolution = getResolution() } = {}) {
    const sprite = new Sprite(circleTexture({ radius, color, alpha, resolution }));
    sprite.width = sprite.height = radius * 2;
    sprite.anchor.set(0.5);
    return sprite;
}
