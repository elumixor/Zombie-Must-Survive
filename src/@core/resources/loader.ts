import { Assets } from "pixi.js";

export class Loader {
    protected resources = [] as [string, string][];

    constructor(public bundleName: string) {}

    load() {
        Assets.addBundle(this.bundleName, Object.fromEntries(this.resources));
        return Assets.loadBundle(this.bundleName);
    }

    add(id: string, path: string) {
        this.resources.push([id, path]);
    }

    get<T = unknown>(name: string) {
        return Assets.get<T | undefined>(name);
    }
}
