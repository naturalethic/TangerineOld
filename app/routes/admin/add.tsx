import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import Database from "~/lib/database";
import { rid } from "~/lib/helper";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const table = form.get("table") as string;
    const record = JSON.parse(form.get("record") as string);
    const item = await Database.meta.create(table, record);
    return redirect(`/admin/${table}/${rid(item)}`);
};
