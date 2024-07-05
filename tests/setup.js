import { group } from "k6";

const createGroupFunction = (defaultName) => (nameOrFn, fn) => {
    if (typeof nameOrFn === "function") {
        return group(defaultName, nameOrFn);
    } else {
        return group(`${defaultName} (${nameOrFn})`, fn);
    }
};

export const forEachCase = createGroupFunction("Fälle");
export const given = createGroupFunction("Gegeben sei");
export const when = createGroupFunction("Wenn");
export const then = createGroupFunction("Dann");
export const scenario = (name, fn) => group(`Szenario: ${name}`, fn);
