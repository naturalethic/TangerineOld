import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import Database from "~/lib/database";
import { inv } from "~/lib/helper";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const id = inv(form.get("id"), "ID is required");
    const table = inv(form.get("table"), "Table is required");
    await Database.meta.delete(table, id);
    return redirect("/admin");
};
