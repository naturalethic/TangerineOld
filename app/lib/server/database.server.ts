import Surreal from "surrealdb.js";
import { packId } from "../helper";
import type { Identified } from "../types";

export class Connection {
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

    async query<T>(
        query: string,
        vars?: Record<string, unknown>,
    ): Promise<T[]> {
        const result = await this.db.query(query, vars);
        if (result.length) {
            return result[result.length - 1].result as T[];
        }
        return [];
    }

    async queryFirst<T>(
        query: string,
        vars?: Record<string, unknown>,
    ): Promise<T> {
        return (await this.query<T>(query, vars))[0];
    }

    async select<T>(thing: string): Promise<T[]>;
    async select<T>(table: string, id: string): Promise<T>;
    async select<T>(thing_or_table: string, id?: string): Promise<T[] | T> {
        const result = id
            ? await this.db.select(packId(thing_or_table, id))
            : await this.db.select(thing_or_table);
        if (id || thing_or_table.includes(":")) {
            return result[0] as T;
        }
        return result as T[];
    }

    async change<T extends Identified>(record: T) {
        this.db.change(record.id, record);
    }

    async update<T extends Identified>(record: T) {
        this.db.update(record.id, record);
    }

    async create<T extends Identified>(
        table: string,
        record: Record<string, unknown> = {},
    ) {
        return this.db.create(table, record);
    }

    async delete(thing: string): Promise<void>;
    async delete(table: string, id: string): Promise<void>;
    async delete(thing_or_table: string, id?: string): Promise<void> {
        const result = id
            ? await this.db.delete(packId(thing_or_table, id))
            : await this.db.delete(thing_or_table);
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
                this.connections.push(connection);
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

declare global {
    var pool: Pool;
}

if (typeof pool === "undefined") {
    pool = new Pool(10);
}

export async function withDb<T>(
    fn: (db: Connection) => Promise<any>,
): Promise<T> {
    const db = await pool.acquire();
    try {
        return await fn(db);
    } finally {
        await pool.release(db);
    }
}
