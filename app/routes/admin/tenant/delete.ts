// import type { ActionFunction } from "@remix-run/node";
// import { db } from "~/lib/database";
// import { inv } from "~/lib/helper";

// import { redirect } from "@remix-run/node";

// export const action: ActionFunction = async ({ request }) => {
//     const form = await request.formData();
//     const id = inv(form.get("id"), "ID is required");
//     await db.delete("_tenant", id);
//     return redirect("/admin");
// };
