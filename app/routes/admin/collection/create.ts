import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/lib/database";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const name = form.get("name") as string;
    const record = await db.create("_collection", { name });
    return json(record);
};
