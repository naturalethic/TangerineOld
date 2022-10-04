import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/lib/database";
import { rid } from "~/lib/helper";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const record = JSON.parse(form.get("record") as string);
    const item = await db.create("_collection", record);
    return redirect(`/admin/collection/${rid(item)}`);
};
