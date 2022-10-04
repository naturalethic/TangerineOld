import type { ActionFunction } from "@remix-run/node";
import { setProperty } from "dot-prop";
import { db } from "~/lib/database";
import { inv } from "~/lib/helper";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const table = inv(form.get("table"), "Table is required");
    const record = {};
    for (const [key, value] of form.entries()) {
        if (!["table"].includes(key)) {
            setProperty(record, key, value);
        }
    }
    if (request.method === "POST") {
        await db.create(table, record);
    }
    return null;
};
