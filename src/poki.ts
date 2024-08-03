import { injectable } from "@core/di";
import { EventEmitter } from "@elumixor/frontils";

interface PokiSDK {
    rewardedBreak(onAddStarted: () => void): PromiseLike<boolean>;
    gameplayStop(): void;
    gameplayStart(): void;
    commercialBreak(onAddStarted?: () => void): PromiseLike<void>;
    gameLoadingFinished(): void;
    setDebug(isDebug: boolean): void;
    init(): PromiseLike<void>;
}

// This object is globally provided by Poki SDK
declare const PokiSDK: PokiSDK;

@injectable
export class Poki {
    readonly addStarted = new EventEmitter();

    private set gameplayActive(value: boolean) {
        if (development) return;

        if (value) PokiSDK.gameplayStart();
        else PokiSDK.gameplayStop();
    }

    async init() {
        if (development) {
            logs("Detected DEV environment: Poki SDK will not be loaded");
            return;
        }

        await PokiSDK.init();
        PokiSDK.setDebug(import.meta.env.DEV);
    }

    onLoadingFinished() {
        if (!development) PokiSDK.gameLoadingFinished();
        this.gameplayActive = true;
    }

    async playCommercialBreak() {
        if (development) return;

        this.gameplayActive = false;
        await PokiSDK.commercialBreak();
        this.gameplayActive = true;
    }

    /**
     * @returns `true` if the user watched the ad to the end and should receive reward,
     *          `false` if the user skipped the ad.
     */
    async playRewardedBreak() {
        if (development) return true;

        this.gameplayActive = false;
        const rewarded = await PokiSDK.rewardedBreak(() => this.addStarted.emit());
        this.gameplayActive = true;
        return rewarded;
    }
}
