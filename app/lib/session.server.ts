import { createSessionStorage, Session as RemixSession } from "@remix-run/node";
import { db } from "./database";
import { Session as SessionBase } from "./types";

function createDatabaseSessionStorage() {
    return createSessionStorage({
        cookie: { name: "session", secrets: [process.env.COOKIE_SECRET!] },
        async createData(data, expires) {
            const session = await db.create<SessionBase>("_session", {
                data,
                expires,
            });
            return session.id;
        },
        async readData(id) {
            return (await db.select<SessionBase>("_session", id)).data;
        },
        async updateData(id, data, expires) {
            const session = await db.select<SessionBase>("_session", id);
            if (!session) {
                return;
            }
            session.data = data;
            session.expires = expires;
            await db.update(session);
        },
        async deleteData(id) {
            await db.delete("_session", id);
        },
    });
}

const storage = createDatabaseSessionStorage();

// class Session {
//     session: RemixSession;

//     constructor(session: RemixSession) {
//         this.session = session;
//     }

//     static async get(request: Request): Promise<Session> {
//         // return new Session(
//         //     await storage.getSession(request.headers.get("Cookie")),
//         // );
//     }

//     has(key: string): boolean {
//         return this.session.has(key);
//     }

//     get(key: string): any {
//         return this.session.get(key);
//     }

//     set(key: string, value: any): void {
//         this.session.set(key, value);
//     }

//     unset(key: string): void {
//         this.session.unset(key);
//     }

//     flash(key: string, value: any): void {
//         this.session.flash(key, value);
//     }

//     async commit(): Promise<Record<string, string>> {
//         return { "Set-Cookie": await storage.commitSession(this.session) };
//     }

//     async destroy(): Promise<void> {
//         await storage.destroySession(this.session);
//     }
// }

// export const getSession = async (request: Request): Promise<Session> => {
//     // return await Session.get(request);
// };

export const getSession = () => {};
