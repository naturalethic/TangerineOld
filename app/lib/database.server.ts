import type { Identified } from "./types";

export class Database {
    namespace: string;
    database: string;

    constructor(namespace: string = "test", database: string = "test") {
        this.namespace = namespace;
        this.database = database;
    }

    async call(
        method: string,
        path: string,
        body: object | string | null = null,
    ) {
        const result = await fetch(`${process.env.DATABASE_ENDPOINT!}${path}`, {
            method,
            headers: {
                Authorization: `Basic ${btoa("root:root")}`,
                Accept: "application/json",
                NS: this.namespace,
                DB: this.database,
            },
            ...(body && {
                body: typeof body === "object" ? JSON.stringify(body) : body,
            }),
        });
        if (result.status === 200) {
            return (await result.json())[0].result;
        }
        throw new Error(await result.text());
    }

    async query(
        statement: string,
        first = false,
    ): Promise<Record<string, any>> {
        const result = await this.call("post", "/sql", statement);
        if (first) {
            return result[0];
        }
        return result;
    }

    async tables(): Promise<string[]> {
        const result = await this.query("info for database");
        return Object.keys(result.tb);
    }

    async create<T extends Identified>(
        table: string,
        record: Record<string, unknown> = {},
    ): Promise<T> {
        return (await this.call("post", `/key/${table}`, record))[0] as T;
    }

    async update<T extends Identified>(record: T): Promise<T> {
        const [table, id] = record.id.split(":");
        return (await this.call("put", `/key/${table}/${id}`, record)) as T;
    }

    async delete(table: string, id: string | number): Promise<void> {
        await this.call("delete", `/key/${table}/${id}`);
    }

    async select<T extends Identified>(table: string): Promise<T[]>;
    async select<T extends Identified>(
        table: string,
        id?: string | number,
    ): Promise<T>;
    async select<T extends Identified>(
        table: string,
        id?: string | number,
    ): Promise<T[] | T> {
        if (id) {
            return (await this.call("get", `/key/${table}/${id}`))[0] as T;
        }
        return (await this.call("get", `/key/${table}`)) as T[];
    }

    async first<T extends Identified>(table: string): Promise<T | null> {
        let records = await this.select(table);
        if (records.length === 0) {
            return null;
        }
        return records[0] as T;
    }
}

export const db = new Database();
