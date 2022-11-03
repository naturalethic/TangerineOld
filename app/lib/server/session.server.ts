import {
    createSessionStorage,
    Session as RemixSession,
    SessionStorage,
} from "@remix-run/node";
import { packId, unpackId } from "../helper";
import { Identity, Session as SessionBase } from "../types";
import { withDb } from "./database.server";

function createDatabaseSessionStorage() {
    return createSessionStorage({
        cookie: { name: "session", secrets: [process.env.COOKIE_SECRET!] },
        async createData(data, expires) {
            return await withDb(async (db) => {
                const session = await db.create<SessionBase>("_session", {
                    data,
                    expires,
                });
                return unpackId(session.id);
            });
        },
        async readData(id) {
            return withDb(async (db) => {
                try {
                    return (await db.select<SessionBase>("_session", id))?.data;
                } catch (error) {
                    return null;
                }
            });
        },
        async updateData(id, data, expires) {
            await withDb(async (db) => {
                await db.update<SessionBase>({
                    id: packId("_session", id),
                    data,
                    expires,
                });
            });
        },
        async deleteData(id) {
            await withDb(async (db) => {
                await db.delete("_session", id);
            });
        },
    });
}

declare global {
    var storage: SessionStorage;
}

if (typeof storage === "undefined") {
    storage = createDatabaseSessionStorage();
}

export class Session {
    session: RemixSession;

    constructor(session: RemixSession) {
        this.session = session;
    }

    static async get(request: Request): Promise<Session> {
        return new Session(
            await storage.getSession(request.headers.get("cookie")),
        );
    }

    has(key: string): boolean {
        return this.session.has(key);
    }

    get(key: string): any {
        return this.session.get(key);
    }

    set(key: string, value: any): void {
        this.session.set(key, value);
    }

    unset(key: string): void {
        this.session.unset(key);
    }

    flash(key: string, value: any): void {
        this.session.flash(key, value);
    }

    async commit(): Promise<Record<string, string>> {
        return { "Set-Cookie": await storage.commitSession(this.session) };
    }

    async destroy(): Promise<Record<string, string>> {
        return { "Set-Cookie": await storage.destroySession(this.session) };
    }

    async identity(): Promise<Identity | null> {
        const id = this.session.get("identity");
        if (id) {
            return withDb(async (db) => {
                return await db.select<Identity>("_identity", id);
            });
        }
        return null;
    }
}
