import { db } from "./database";
import { Collection, Field, Tenant } from "./types";

export default {
    collection: {
        async all(): Promise<Collection[]> {
            const collections = await db.select<Collection>("_collection");
            collections.sort((a: Collection, b: Collection) =>
                a.name.localeCompare(b.name),
            );
            return collections;
        },
        async get(id: string): Promise<Collection> {
            return await db.select<Collection>("_collection", id);
        },
    },
    field: {
        async all(collection?: string): Promise<Field[]> {
            let fields: Field[];
            if (collection) {
                fields = (await db.query(
                    `SELECT * FROM _field WHERE collection = _collection:${collection}`,
                )) as Field[];
            } else {
                fields = await db.select<Field>("_field");
            }
            fields.sort((a: Field, b: Field) => a.name.localeCompare(b.name));
            return fields;
        },
    },
    tenant: {
        async all(): Promise<Tenant[]> {
            const tenants = await db.select<Tenant>("_tenant");
            tenants.sort((a: Tenant, b: Tenant) => {
                return a.name.localeCompare(b.name);
            });
            return tenants;
        },
        async get(id: string): Promise<Tenant> {
            return await db.select<Tenant>("_tenant", id);
        },
    },
};
