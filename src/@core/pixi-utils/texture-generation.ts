import { filters, Graphics, RenderTexture, SCALE_MODES, Sprite } from "pixi.js";
import type { IRenderer } from "pixi.js";
import { inject } from "@core/di";
import { App } from "@core/app";

let renderer: IRenderer | undefined;
function r() {
    if (!renderer) renderer = inject(App).renderer;
    return renderer;
}

export function generateTexture(
    graphics: Graphics,
    scaleMode: SCALE_MODES = SCALE_MODES.LINEAR,
    resolution = inject(App).resolution,
) {
    resolution = Math.max(1, Math.floor(resolution));

    return r().generateTexture(graphics, { scaleMode, resolution });
}

export function rectGraphics({ width = 2, height = 2, color = 0, alpha = 1, roundedRadius = 0 } = {}) {
    const graphics = new Graphics();
    graphics.beginFill(color, alpha);
    if (roundedRadius) graphics.drawRoundedRect(0, 0, width, height, roundedRadius);
    else graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    return graphics;
}

export function rectTexture({ width = 2, height = 2, color = 0, alpha = 1, roundedRadius = 0 } = {}) {
    return generateTexture(rectGraphics({ width, height, color, alpha, roundedRadius }));
}

export function ellipseTexture(width: number, height: number, { color = 0, alpha = 1 } = {}) {
    const graphics = new Graphics();
    graphics.beginFill(color, alpha);
    graphics.drawEllipse(width / 2, height / 2, width, height);
    graphics.endFill();
    return generateTexture(graphics);
}

export function circleTexture(radius: number, { color = 0, alpha = 1 } = {}) {
    return ellipseTexture(radius * 2, radius * 2, { color, alpha });
}

export function blurredCircle(radius: number, { color = 0xffffff, alpha = 1, blurStrength = 10, padding = 5 } = {}) {
    const gfx = new Graphics();
    gfx.beginFill(color, alpha);
    gfx.drawCircle(0, 0, radius);
    gfx.filters = [new filters.BlurFilter(blurStrength)];

    const center = radius + blurStrength + padding;
    gfx.position.set(center);

    const size = center * 2;
    const renderTexture = RenderTexture.create({ width: size, height: size });
    renderTexture.defaultAnchor.set(0.5);

    r().render(gfx, { renderTexture });

    gfx.destroy();

    return new Sprite(renderTexture);
}

export function rectSprite({ width = 2, height = 2, color = 0, alpha = 1, roundedRadius = 0 } = {}) {
    const [w, h] = roundedRadius === 0 ? [2, 2] : [width, height];
    const sprite = new Sprite(rectTexture({ width: w, height: h, color, alpha, roundedRadius }));
    sprite.width = width;
    sprite.height = height;
    return sprite;
}

export function circleSprite({ radius = 50, color = 0, alpha = 1 } = {}) {
    const sprite = new Sprite(circleTexture(radius, { color, alpha }));
    sprite.width = sprite.height = radius * 2;
    sprite.anchor.set(0.5);
    return sprite;
}
