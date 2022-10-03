import Database from "./database";
import { rid } from "./helper";
import { Field, Identified } from "./types";

export class Tenant implements Identified {
    id: string = "";
    name: string = "";

    constructor(init: Partial<Tenant> = {}) {
        Object.assign(this, init);
    }

    static async all(): Promise<Tenant[]> {
        const tenants = (await Database.meta.select<Tenant>("tenant")).map(
            (it) => new Tenant(it),
        );
        let site = tenants.find(
            (tenant: Tenant) => tenant.id === "tenant:site",
        );
        if (!site) {
            site = new Tenant({ id: "tenant:site", name: "Site" });
            tenants.unshift(site);
            await Database.meta.update(site);
        }
        tenants.sort((a: Tenant, b: Tenant) => {
            if (a.id === "tenant:site") {
                return -1;
            }
            if (b.id === "tenant:site") {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
        return tenants;
    }

    static async get(id: string): Promise<Tenant> {
        return new Tenant(await Database.meta.select<Tenant>("tenant", id));
    }

    get db(): Database {
        return Database.tenant(rid(this));
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
        const collections = (
            await Database.meta.select<Collection>("collection")
        ).map((it) => new Collection(it));
        collections.sort((a: Collection, b: Collection) =>
            a.name.localeCompare(b.name),
        );
        return collections;
    }
}
