import { Vec2 } from "@core/extensions";
import { CircleColliderComponent } from "./collider-component";
import { Component } from "@core/components";
import type { Actor } from "@core/actor";

export class CollisionManager extends Component {
    private readonly tagsToComponents = new Map<string, Set<CircleColliderComponent>>();
    private readonly components = new Set<CircleColliderComponent>();
    private readonly componentToRelated = new Map<CircleColliderComponent, CircleColliderComponent[]>();

    // Start with the tick disabled and enable it when there are components
    override tickEnabled = false;

    // An optimization to not recalculate related every frame
    // and also to not recalculate related if multiple components are added/removed at once
    private needsRelatedRecalculation = false;

    /** Returns a list of components to check collisions with */
    private getRelated(component: CircleColliderComponent) {
        const arr = [...component.targetTags].flatMap((g) => [...(this.tagsToComponents.get(g) ?? [])]);
        return arr.filter((c) => c !== component);
    }

    add(component: CircleColliderComponent) {
        for (const tag of component.selfTags) {
            const set = this.tagsToComponents.get(tag) ?? new Set();
            this.tagsToComponents.set(tag, set);
            set.add(component);
        }

        this.components.add(component);

        this.needsRelatedRecalculation = true;
        this.tickEnabled = true;
    }

    delete(component: CircleColliderComponent) {
        for (const tag of component.selfTags) this.tagsToComponents.get(tag)?.delete(component);
        this.components.delete(component);

        // Stop ticking if there are no more components
        this.tickEnabled = this.components.nonEmpty;
        this.needsRelatedRecalculation = true;
    }

    override update(dt: number) {
        super.update(dt);

        if (this.needsRelatedRecalculation) {
            this.recalculateRelated();
            this.needsRelatedRecalculation = false;
        }

        const collisions = new Map(
            [...this.components].map((component) => [
                component,
                { force: Vec2.zero, anotherColliders: new Set<CircleColliderComponent>() },
            ]),
        );

        for (const a of this.components) {
            const aActor = a.actor;

            const aPosition = aActor.worldPosition;
            const { force: aF, anotherColliders: aColliders } = collisions.get(a)!;

            for (const b of this.componentToRelated.get(a) ?? []) {
                assert(b !== a, "Collision with self!");
                const bActor = b.actor;

                const bPosition = bActor.worldPosition;

                const offset = bPosition.sub(aPosition); // from a to b
                const distance = offset.length;
                const minDistance = a.radius + b.radius;

                if (distance >= minDistance) continue;

                aColliders.add(b);

                if (a.isTrigger || b.isTrigger) continue;

                const overlap = minDistance - distance;
                const total = a.pushStrength + b.pushStrength;
                const aRatio = a.pushStrength / total;
                const bRatio = 1 - aRatio;

                aF.isub(offset.withLength(overlap * bRatio));
            }
        }

        for (const [a, { force, anotherColliders }] of collisions) {
            a.currentCollisions = anotherColliders;
            a.forceRequested.emit(force);
        }
    }

    *getCollisions(owner: Actor, tags: Set<string>, triggerRange: number) {
        assert(this.level);

        const affectedActors = [...tags]
            .flatMap((g) => [...(this.tagsToComponents.get(g) ?? [])])
            .map((c) => c.actor)
            .filter((o) => o !== owner);

        const ownerPosition = owner.worldPosition;

        for (const actor of affectedActors) {
            const actorPosition = actor.worldPosition;
            const distance = ownerPosition.distanceTo(actorPosition);

            if (distance <= triggerRange) yield actor;
        }
    }

    private recalculateRelated() {
        // Recalculate related to not do it every frame
        this.componentToRelated.clear();
        for (const a of this.components) {
            const related = this.getRelated(a);
            this.componentToRelated.set(a, related);
        }
    }
}
