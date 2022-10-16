import { makeDomainFunction } from "domain-functions";
import { formAction } from "remix-forms";
import { Collection } from "~/lib/types";

import { ActionFunction } from "@remix-run/node";

// export const action: ActionFunction = async ({ request }) => {
// 	const form = await request.formData();
// 	const collection: Collection = {
// 		id: form.get("id") as string,
// 		name: form.get("name") as string,
// 	};
// 	const record = await db.update(collection);
// 	return redirect("/admin/collection");
// 	// return json(record);
// };

const mutation = makeDomainFunction(Collection)(async (collection) => {
	//
});

export const action: ActionFunction = async ({ request }) => {
	formAction({ request, schema: Collection, mutation });
};
