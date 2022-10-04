import { db } from "./database";
import { Field, Identified } from "./types";

export class Tenant implements Identified {
    id: string = "";
    name: string = "";

    constructor(init: Partial<Tenant> = {}) {
        Object.assign(this, init);
    }

    static async all(): Promise<Tenant[]> {
        const tenants = (await db.select<Tenant>("_tenant")).map(
            (it) => new Tenant(it),
        );
        tenants.sort((a: Tenant, b: Tenant) => {
            return a.name.localeCompare(b.name);
        });
        return tenants;
    }

    static async get(id: string): Promise<Tenant> {
        return new Tenant(await db.select<Tenant>("_tenant", id));
    }
}

export class Collection implements Identified {
    id: string = "";
    name: string = "";
    fields: Field[] = [];

    constructor(init: Partial<Collection> = {}) {
        Object.assign(this, init);
    }

    static async all(): Promise<Collection[]> {
        const collections = (await db.select<Collection>("_collection")).map(
            (it) => new Collection(it),
        );
        collections.sort((a: Collection, b: Collection) =>
            a.name.localeCompare(b.name),
        );
        return collections;
    }
}
