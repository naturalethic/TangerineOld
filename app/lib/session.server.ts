import { createSessionStorage, Session as RemixSession } from "@remix-run/node";
import { db } from "./database.server";
import { unpackId } from "./helper";
import { Identity, Session as SessionBase } from "./types";

function createDatabaseSessionStorage() {
    return createSessionStorage({
        cookie: { name: "session", secrets: [process.env.COOKIE_SECRET!] },
        async createData(data, expires) {
            console.log("createData", data, expires);
            const session = await db.create<SessionBase>("_session", {
                data,
                expires,
            });
            return unpackId(session.id);
        },
        async readData(id) {
            return (await db.select<SessionBase>("_session", id))?.data;
        },
        async updateData(id, data, expires) {
            console.log("updateData", id, data, expires);
            const session = await db.select<SessionBase>("_session", id);
            if (session) {
                session.data = data;
                session.expires = expires;
                await db.update(session);
            }
        },
        async deleteData(id) {
            console.log("deleteData", id);
            await db.delete("_session", id);
        },
    });
}

const storage = createDatabaseSessionStorage();

class Session {
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
            return await db.select<Identity>("_identity", id);
        }
        return null;
    }
}

export const getSession = async (request: Request): Promise<Session> => {
    return await Session.get(request);
};
