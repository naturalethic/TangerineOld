import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/lib/database";
import { Collection } from "~/lib/model";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const collection: Collection = {
        id: form.get("id") as string,
        name: form.get("name") as string,
        fields: [],
    };
    const record = await db.update(collection);
    return json(record);
};
