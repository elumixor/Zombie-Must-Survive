import { RenderTexture, Texture } from "pixi.js";
import { Spine } from "@core/spine";
import { App } from "@core/app";
import { inject } from "@core/di";

export interface IGenerationContext {
    /**
     * Contains the property name in Resources class that is used to point to the spine
     */
    name: string;
    /**
     * Options used to generate the texture
     */
    options: IGenerationOptions;
}

export interface IGenerationOptions {
    /**
     * Name of the texture to save to.
     */
    texture: string | ((context: IGenerationContext) => string);
    /**
     * Name of the animation used to generate the texture for the static symbols on the reels.
     *
     * If unspecified, will use the current/latest one.
     */
    animation?: string;
    /**
     * Skin to be used for the spine.
     *
     * If unspecified will use the current/latest one.
     */
    skin?: string;
    /**
     * Default scale of the spine, also used to generate the texture for the static symbols on the reels.
     *
     * Defaults to 1.
     */
    scale?: number | readonly [number, number];
    /**
     * Offset. Either uniform or [x, y].
     *
     * Defaults to 0.
     */
    offset?: number | readonly [number, number];
    /**
     * Padding to add to the texture. Either uniform or [x, y].
     *
     * Defaults to 0.
     */
    padding?: number | readonly [number, number];
    /**
     * Resolution of the texture. Defaults to window.resolution
     */
    resolution?: number;
}

export function generateSpineTexture(
    spine: Spine,
    options: IGenerationOptions,
    context: Omit<IGenerationContext, "options">,
) {
    if (!options.resolution) options.resolution = window.resolution;
    const { texture, animation, padding, scale, offset, skin, resolution } = options;

    // Apply the skin
    if (skin !== undefined) {
        spine.skin = skin;
    }

    // Apply the animation
    if (animation !== undefined) {
        // For development this can be useful
        const availableAnimations = spine.animations;

        if (!availableAnimations.includes(animation)) {
            throw new Error(
                `The animation "${animation}" is not available for the spine "${spine.name}". ` +
                    `Available animations: ${availableAnimations.join(", ")}`,
            );
        }

        spine.animate(animation);
    }

    const entry = spine.state.tracks[0];
    entry.timeScale = 0;
    spine.update(0);

    // Determine the scale
    const [sx, sy] = typeof scale === "number" ? [scale, scale] : scale ?? [1, 1];
    spine.scale.set(sx, sy);

    // Determine the offset
    const [ox, oy] = typeof offset === "number" ? [offset, offset] : offset ?? [0, 0];

    // Determine the padding
    const [px, py] = typeof padding === "number" ? [padding, padding] : padding ?? [0, 0];
    spine.position.set((spine.width + px) / 2 + ox, (spine.height + py) / 2 + oy);

    // Render to the texture
    const renderTexture = RenderTexture.create({
        width: spine.width + px,
        height: spine.height + py,
        resolution, // I don't know if this is really good or not
    });
    renderTexture.defaultAnchor.set(0.5);
    inject(App).renderer.render(spine, { renderTexture });

    // Determine the name
    const textureName = typeof texture === "string" ? texture : texture({ ...context, options });

    // Save to cache
    Texture.addToCache(renderTexture, textureName);
}
