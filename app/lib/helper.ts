import type { Identified } from "./types";

export function packId(table: string, id: string | number): string {
	return `${table}:${id}`;
}

export function unpackId(record: Identified): string {
	return record.id.split(":")[1];
}
