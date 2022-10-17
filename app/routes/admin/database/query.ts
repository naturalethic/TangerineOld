import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/lib/database";

export type ActionData = { result: any | null; error: any | null };

export const action: ActionFunction = async ({ request }) => {
    const data: ActionData = { result: null, error: null };
    const form = await request.formData();
    const query = form.get("query") as string;
    try {
        data.result = await db.query(query);
    } catch (error: any) {
        data.error = JSON.parse(error.message);
    }
    return json(data);
};
