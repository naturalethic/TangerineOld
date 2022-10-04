import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/lib/database";
import { inv } from "~/lib/helper";

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const id = inv(form.get("id"), "ID is required");
    await db.delete("_collection", id);
    return redirect("/admin");
};
