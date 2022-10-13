import type { ActionFunction } from "@remix-run/node";
import { db } from "~/lib/database";

import { json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const table = form.get("table") as string;
    if (request.method === "DELETE") {
        const ids = (form.get("ids") as string).split(",");
        for (const id of ids) {
            await db.query(`DELETE FROM ${table} WHERE id = ${id}`);
        }
    }
    const data = await db.query(`SELECT * FROM ${table}`);
    return json(data);
};
