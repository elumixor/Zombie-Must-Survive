import type { SoundSpriteDefinitions } from "howler";

export interface ISoundParameters {
    /**
     * Volume of the sound.
     *
     * Default: `1`.
     */
    volume?: number;
    /**
     * Should the sound be looped?
     *
     * Default: `false`.
     */
    loop?: boolean;
    /**
     * Stereo panning of the sound, ranging from -1 (full left) to 1 (full right).
     *
     * Default: `0`.
     */
    stereo?: number;
    /**
     * Factor by which the volume should be decreased when the game is decreaseVolume() is called.
     *
     * Default: `0.4`.
     */
    volumeDecreaseFactor?: number;
    /**
     * For the sound sprites (where multiple sounds are packed into a single file)
     * this specifies the configuration of them.
     */
    sprite?: SoundSpriteDefinitions;
}
