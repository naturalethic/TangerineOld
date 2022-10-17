import { createAction } from "~/lib/api";

// 	// const form = await request.formData();
// 	// const collection: Collection = {
// 	// 	id: form.get("id") as string,
// 	// 	name: form.get("name") as string,
// 	// 	fields: [],
// 	// };
// 	// const record = await db.update(collection);
// 	// return json(record);
// };

// async function post({ request }: ActionFunction) {
// 	return json({ post: true });
// }

// async function patch() {
// 	return json({ patch: true });
// }

interface Input { name: string }

export const action = createAction<Input>({
	async post({ request, input }) {
		// console.log(input);
		// console.log(await request.json());
		return "OK";
	},
});
