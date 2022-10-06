import { customAlphabet } from "nanoid";
import invariant from "tiny-invariant";

import type { Identified } from "./types";

export function inv(condition: any, message: string): string {
    invariant(condition, message);
    return condition;
}

export function tid(table: string, id: string | number): string {
    return `${table}:${id}`;
}

export function rid(record: Identified): string {
    return record.id.split(":")[1];
}

export function genShortAlphaId() {
    return customAlphabet("abcdefghijklmnopqrstuvwxyz", 8)();
}
