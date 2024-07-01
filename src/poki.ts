import { injectable } from "@core/di";
import { EventEmitter } from "@elumixor/frontils";

declare global {
    interface PokiSDK {
        rewardedBreak(onAddStarted: () => void): PromiseLike<boolean>;
        gameplayStop(): void;
        gameplayStart(): void;
        commercialBreak(onAddStarted?: () => void): PromiseLike<void>;
        gameLoadingFinished(): void;
        setDebug(isDebug: boolean): void;
        init(): PromiseLike<void>;
    }

    const PokiSDK: PokiSDK;
}

@injectable
export class Poki {
    readonly paused = new EventEmitter<boolean>();

    private set gameplayActive(value: boolean) {
        if (value) PokiSDK.gameplayStart();
        else PokiSDK.gameplayStop();
    }

    async init() {
        await PokiSDK.init();
        PokiSDK.setDebug(import.meta.env.DEV);
    }

    onLoadingFinished() {
        PokiSDK.gameLoadingFinished();
        this.gameplayActive = true;
    }

    async playCommercialBreak() {
        this.gameplayActive = false;
        await PokiSDK.commercialBreak();
        this.gameplayActive = true;
    }

    /**
     * @returns `true` if the user watched the ad to the end and should receive reward,
     *          `false` if the user skipped the ad.
     */
    async playRewardedBreak() {
        this.gameplayActive = false;
        const rewarded = await PokiSDK.rewardedBreak(() => this.paused.emit(true));
        this.gameplayActive = true;
        this.paused.emit(false);
        return rewarded;
    }
}
