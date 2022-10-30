import Surreal, { Result } from "surrealdb.js";
import type { Identified } from "./types";

class Database {
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

class Connection {
    namespace: string;
    database: string;
    acquired: boolean;
    db: Surreal;

    constructor(namespace: string = "test", database: string = "test") {
        this.namespace = namespace;
        this.database = database;
        this.acquired = false;
        this.db = new Surreal(`${process.env.DATABASE_ENDPOINT!}/rpc`);
    }

    async connect() {
        await this.db.signin({
            user: "root",
            pass: "root",
        });
        await this.db.use(this.namespace, this.database);
    }

    async query<T = Result[]>(
        query: string,
        vars?: Record<string, unknown>,
    ): Promise<T> {
        return this.db.query(query, vars);
    }
}

class Pool {
    max: number;
    connections: Connection[];
    waitlist: ((connection: Connection) => void)[];

    constructor(max: number) {
        this.max = max;
        this.connections = [];
        this.waitlist = [];
    }

    async acquire(): Promise<Connection> {
        let connection: Connection | null = null;
        for (let i = 0; i < this.connections.length; i++) {
            if (!this.connections[i].acquired) {
                connection = this.connections[i];
                connection.acquired = true;
                break;
            }
        }
        if (!connection) {
            if (this.connections.length < this.max) {
                connection = new Connection();
                connection.acquired = true;
                this.connections.push(new Connection());
                await connection.connect();
            }
        }
        if (connection) {
            return connection;
        }
        return new Promise((resolve) => {
            this.waitlist.push(resolve);
        });
    }

    async release(connection: Connection) {
        if (this.waitlist.length) {
            this.waitlist.shift()!(connection);
        } else {
            connection.acquired = false;
        }
    }
}

const pool = new Pool(10);

export async function withDb(
    fn: (db: Database) => Promise<any>,
): Promise<void> {
    const connection = await pool.acquire();
    try {
        return await fn(db);
    } finally {
        await pool.release(connection);
    }
}

/**
 * Attempted higher order function approach to automatic collection closing.
 * This doesn't work because it produces a side effect in the client bundle.
 */

// import type {
//     AppData,
//     DataFunctionArgs,
//     LoaderFunction,
// } from "@remix-run/node";

// export interface ConnectedDataFunctionArgs extends DataFunctionArgs {
//     db: Connection;
// }

// export interface ConnectedLoaderFunction {
//     (args: ConnectedDataFunctionArgs):
//         | Promise<Response>
//         | Response
//         | Promise<AppData>
//         | AppData;
// }

// export function dbLoader(fn: ConnectedLoaderFunction): LoaderFunction {
//     return async function (args: DataFunctionArgs) {
//         const db = await pool.acquire();
//         try {
//             return await fn({ ...args, db });
//         } finally {
//             await pool.release(db);
//         }
//     };
// }
