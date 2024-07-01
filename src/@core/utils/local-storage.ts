export function getLocalStorage() {
    try {
        return localStorage;
    } catch (err) {
        return undefined;
    }
}

export function locallyStored<T extends object>(defaults: T, path = "item") {
    const storage = getLocalStorage();
    if (!storage) return { ...defaults };

    for (const [key, value] of Object.entries(defaults)) {
        const pathKey = `${path}.${key}`;
        const stored = storage.getItem(pathKey);
        if (!stored) storage.setItem(pathKey, JSON.stringify(value));
    }

    return new Proxy(defaults, {
        get(_, key: string) {
            const pathKey = `${path}.${key}`;
            const stored = storage.getItem(pathKey);
            const defaultValue = defaults[key as keyof T];
            if (stored)
                try {
                    return JSON.parse(stored) as T[keyof T];
                } catch (e) {
                    if (e instanceof Error) debug(`Failed to parse ${pathKey} from localStorage. Reason: ${e.message}`);
                    else debug(`Failed to parse ${pathKey} from localStorage. Reason:`, e);
                    return defaultValue;
                }

            return defaults[key as keyof T];
        },
        set(_, key: string, value: unknown) {
            const pathKey = `${path}.${key}`;
            storage.setItem(pathKey, JSON.stringify(value));
            return true;
        },
    });
}
