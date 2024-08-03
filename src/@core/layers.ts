import { Group, Layer } from "@pixi/layers";
import { App } from "./app";
import { inject } from "./di";

export class Layers {
    private readonly app = inject(App);
    private readonly layers = new Map<string, Layer>();

    constructor() {
        this.add("default");
    }

    add(name: string, group?: Group) {
        const layer = new Layer(group);
        this.app.stage.addChild(layer);
        this.layers.set(name, layer);
        return layer;
    }

    get(name: string) {
        return this.layers.get(name);
    }
}
