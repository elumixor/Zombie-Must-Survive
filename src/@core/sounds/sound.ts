import { inject } from "@core/di";
import { gsap } from "gsap";
import { BaseResources } from "../resources";
import type { ISoundParameters } from "./isound-parameters";
import { SoundInstance } from "./sound-instance";

type ISoundOptions = Omit<ISoundParameters, "shared" | "core">;

interface IPlaySoundOptions extends Omit<ISoundOptions, "sprite"> {
    sprite?: string;
}

export class Sound {
    readonly name;

    protected readonly resources = inject(BaseResources);

    protected readonly properties;
    protected readonly soundsPlaying: SoundInstance[] = [];
    protected readonly volumeDecreaseFactor;

    constructor(
        path: string,
        { loop = false, volume = 1, stereo = 0, volumeDecreaseFactor = 0.4, sprite = {} }: ISoundParameters = {},
    ) {
        this.volumeDecreaseFactor = volumeDecreaseFactor;
        this.name = path;

        // this is a temporary block of code.
        // we will remove it after fully optimizing the games.
        path = `${this.resources.pathTo("sounds")}/${path}`;

        this.properties = {
            src: [`${path}.mp3`, `${path}.ogg`],
            volume,
            loop,
            stereo,
            autoplay: false,
            preload: true,
            sprite,
        };

        // Preload the sound
        void new SoundInstance(this.properties);
    }

    get isPlaying() {
        return this.soundsPlaying.length > 0;
    }

    get volume() {
        return this.soundsPlaying[0]?.volume() ?? this.properties.volume;
    }

    set volume(value) {
        for (const soundInstance of this.soundsPlaying) void soundInstance.volume(value);
    }

    get baseVolume() {
        return this.properties.volume;
    }

    /**
     * Should only be accessed from {@link VolumesAdjuster}
     */
    set baseVolume(value) {
        this.properties.volume = value;
        this.volume = value;
    }

    get loop() {
        return this.properties.loop;
    }

    set loop(value) {
        this.properties.loop = value;
    }

    play(options?: IPlaySoundOptions) {
        const { sprite, ...howlOptions } = options ?? {};
        const soundInstance = new SoundInstance({ ...this.properties, ...howlOptions });
        this.soundsPlaying.push(soundInstance);

        soundInstance.play(sprite);

        soundInstance.stopped.subscribeOnce(() => {
            const index = this.soundsPlaying.indexOf(soundInstance);
            if (index !== -1) void this.soundsPlaying.splice(index, 1);
        });

        return soundInstance;
    }

    playOnce(options?: IPlaySoundOptions) {
        if (this.isPlaying) return;

        return this.play(options);
    }

    restart() {
        this.stop();
        return this.play();
    }

    stop() {
        for (const instance of this.soundsPlaying) void instance.stop();
        this.soundsPlaying.length = 0;
    }

    decreaseVolume(decreaseFactor = this.volumeDecreaseFactor) {
        this.volume = this.baseVolume * decreaseFactor;
    }

    restoreVolume() {
        this.volume = this.baseVolume;
    }

    fadeIn(duration = 1) {
        return gsap.to(this, { duration, volume: this.baseVolume, overwrite: true });
    }

    async fadeOut(duration = 1, stop = false) {
        await gsap.to(this, { duration, volume: 0, overwrite: true });
        if (stop) this.stop();
    }

    fadeTo(volume: number, duration = 1) {
        return gsap.to(this, { duration, volume, overwrite: true });
    }
}
