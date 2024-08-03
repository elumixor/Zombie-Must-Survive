/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`;

const fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uVelocity;
uniform int uKernelSize;
uniform float uOffset;
uniform vec2 dimensions;

const int MAX_KERNEL_SIZE = 2048;

// Notice:
// the perfect way:
//    int kernelSize = min(uKernelSize, MAX_KERNELSIZE);
// BUT in real use-case , uKernelSize < MAX_KERNELSIZE almost always.
// So use uKernelSize directly.

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord /= dimensions;
    return coord;
}

void main(void)
{
    vec4 base_color = texture2D(uSampler, vTextureCoord);
    vec4 color = base_color;

    if (uKernelSize == 0)
    {
        gl_FragColor = color;
        return;
    }

    vec2 velocity = uVelocity / filterArea.xy;
    float offset = -uOffset / length(uVelocity) - 0.5;
    int k = uKernelSize - 1;

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }
        vec2 bias = velocity * (float(i) / float(k) + offset);
        color += texture2D(uSampler, vTextureCoord + bias);
    }

    vec4 blur_color = color / float(uKernelSize);
    float mix = clamp(2.0 * pow(2.0 * length(mapCoord(vTextureCoord) - 0.5), 1.2) - 0.25, 0.0, 1.0);

    gl_FragColor = mix * blur_color + (1.0 - mix) * base_color;
}
`;

import { Filter } from "@pixi/core";
import { ObservablePoint, Point } from "@pixi/math";
import type { IPoint } from "@pixi/math";
import type { FilterSystem, RenderTexture } from "@pixi/core";
import type { CLEAR_MODES } from "@pixi/constants";

/**
 * The MotionBlurFilter applies a Motion blur to an object.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/motion-blur.png)
 *
 * @class
 * @extends Filter
 * @memberof filters
 * @see {@link https://www.npmjs.com/package/@pixi/filter-motion-blur|@pixi/filter-motion-blur}
 * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
 */
class MotionBlurFilter extends Filter {
    /**
     * The kernelSize of the blur, higher values are slower but look better.
     * Use odd value greater than 5.
     */
    kernelSize = 5;

    private readonly _velocity: IPoint;

    /**
     * @param velocity - Sets the velocity of the motion for blur effect.
     * @param kernelSize - The kernelSize of the blur filter. Must be odd number >= 5
     * @param offset - The offset of the blur filter.
     */
    constructor(velocity: number[] | Point | ObservablePoint = [0, 0], kernelSize = 5, offset = 0) {
        super(vertex, fragment);
        this.uniforms.uVelocity = new Float32Array(2);
        this._velocity = new ObservablePoint(this.velocityChanged.bind(this), this);
        this.setVelocity(velocity);

        this.kernelSize = kernelSize;
        this.offset = offset;
    }

    /**
     * Sets the velocity of the motion for blur effect.
     *
     * @member {ObservablePoint|Point|number[]}
     */
    set velocity(value: IPoint) {
        this.setVelocity(value);
    }
    get velocity(): IPoint {
        return this._velocity;
    }

    /**
     * The offset of the blur filter.
     * @default 0
     */
    set offset(value: number) {
        this.uniforms.uOffset = value;
    }

    get offset(): number {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.uniforms.uOffset;
    }

    /**
     * Override existing apply method in Filter
     * @private
     */
    override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clear: CLEAR_MODES): void {
        const { x, y } = this.velocity;

        this.uniforms.uKernelSize = x !== 0 || y !== 0 ? this.kernelSize : 0;
        filterManager.applyFilter(this, input, output, clear);
    }

    /**
     * Set velocity with more broad types
     */
    private setVelocity(value: IPoint | number[]) {
        if (Array.isArray(value)) {
            const [x, y] = value;

            this._velocity.set(x, y);
        } else {
            this._velocity.copyFrom(value);
        }
    }

    /**
     * Handle velocity changed
     * @private
     */
    private velocityChanged() {
        this.uniforms.uVelocity[0] = this._velocity.x;
        this.uniforms.uVelocity[1] = this._velocity.y;

        // The padding will be increased as the velocity and intern the blur size is changed
        // eslint-disable-next-line no-bitwise
        this.padding = (Math.max(Math.abs(this._velocity.x), Math.abs(this._velocity.y)) >> 0) + 1;
    }
}

export { MotionBlurFilter };
