import { Howler } from "howler";
import { locallyStored } from "@core/utils";
import { injectable } from "@core/di";

@injectable
export abstract class BaseSounds {
    protected readonly settings = locallyStored(
        {
            volume: 1,
            isMuted: false,
        },
        "sounds",
    );

    constructor() {
        // Set the volumes from the local storage.
        this.muted = this.settings.isMuted;
        this.volume = this.settings.volume;

        // Mute when focused out of the window.
        window.addEventListener("focus", () => (this.muted = false));
        window.addEventListener("blur", () => (this.muted = true));
    }

    // We use this field instead of Howler.volume() to restore the volume after unmuting.
    get volume() {
        return this.settings.volume;
    }

    set volume(value: number) {
        this.settings.volume = value;
        Howler.volume(value);
    }

    get muted() {
        return this.settings.isMuted;
    }

    set muted(value: boolean) {
        this.settings.isMuted = value;
        Howler.mute(value);
        if (!value) {
            this.volume = this.volume === 0 ? 1 : this.volume;
            Howler.volume(this.volume);
        }
    }
}
