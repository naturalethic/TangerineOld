import type { Identified } from "./types";

export function packId(table: string, id: string | number): string {
    return `${table}:${id}`;
}

export function unpackId(item: Identified | string): string {
    if (typeof item === "string") {
        return item.split(":")[1];
    }
    return item.id.split(":")[1];
}
