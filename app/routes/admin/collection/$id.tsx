import { makeDomainFunction } from "domain-functions";
import { Form, formAction } from "remix-forms";
import { z } from "zod";
import { db } from "~/lib/database";
import model from "~/lib/model";
import { Collection, Field } from "~/lib/types";

import { ActionFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "@remix-run/node";

const Params = z.object({
	id: z.string(),
});

type LoaderData = {
	collection: Collection;
	fields: Field[];
};

export const loader: LoaderFunction = async ({ params }) => {
	const { id } = Params.parse(params);
	const collection = await model.collection.get(id);
	const fields = await model.field.all(id);
	return json({ collection, fields });
};

const mutation = makeDomainFunction(Collection)(async (collection) => {
	return await db.update(collection);
});

export const action: ActionFunction = async ({ request }) =>
	formAction({ request, schema: Collection, mutation });

export default function CollectionRecordRoute() {
	const { collection, fields } = useLoaderData<LoaderData>();

	// const [fields, setFields] = useState<Field[]>(collection.fields);

	// const onAddField = () => {
	// 	const name = faker.word.noun();
	// 	const type = faker.helpers.arrayElement([
	// 		"checkbox",
	// 		"text",
	// 		"radio",
	// 		"date",
	// 		"time",
	// 		"datetime",
	// 	]) as Field["type"];
	// 	const field = Field.parse({ name, type });
	// 	// type === "radio" ? { name, type, values: [] } : { name, type };
	// 	setFields([...fields, field]);
	// };

	// const onChangeFieldType = (index: number, type: Field["type"]) => {
	// 	const newFields = [...fields];
	// 	newFields[index].type = type;
	// 	setFields(newFields);
	// };

	// const cellClass = "border border-zinc-600 px-2 py-1";

	// const validator = withZod(Collection);

	const onClickNewField = () => {
		// const name = prompt("Collection name");
		// if (name) {
		// 	action.submit(
		// 		{ name: singularize(name).toLowerCase() },
		// 		{ method: "post", action: "/admin/collection/create" },
		// 	);
		// }
	};

	return (
		<div className="flex flex-col bg-zinc-800 rounded h-full px-4 py-4">
			<Form
				// action="/admin/collection/update"
				// method="post"
				schema={Collection}
				values={collection}
				hiddenFields={["id"]}
				buttonLabel="Save"
				pendingButtonLabel="Save"
			/>
			<div className="mt-4">Fields</div>
			<div
				className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center"
				// onClick={onClickNew}
			>
				NEW
			</div>

			{/* <Form
					method="patch"
					action="/admin/collection/update"
					validator={withZod(Collection)}
				>
					<Hidden name="id" value={collection.id} />
					<Label label="name">
						<Text name="name" defaultValue={collection.name} />
					</Label>
					<Label label="fields" onAdd={onAddField}>
						<div className="flex flex-col rounded bg-zinc-500 pt-3 text-sm">
							<table className="text-left border-collapse">
								<thead>
									<tr>
										<th className="font-normal px-3">Name</th>
										<th className="font-normal px-3">Type</th>
										<th className="font-normal px-3">Values</th>
									</tr>
								</thead>
								<tbody className="bg-zinc-800">
									{fields.map((field, i) => (
										<tr key={field.name}>
											<td className={cellClass}>
												<Text
													name={`field[${i}].name`}
													defaultValue={field.name}
													border={false}
													ring={false}
												/>
											</td>
											<td className={cellClass}>
												<Select
													value={field.type}
													border={false}
													onChange={(value) =>
														onChangeFieldType(i, value as Field["type"])}
												>
													<Item value="checkbox" label="Checkbox" />
													<Item value="text" label="Text" />
													<Item value="radio" label="Radio" />
													<Item value="date" label="Date" />
													<Item value="time" label="Time" />
													<Item value="datetime" label="Datetime" />
												</Select>
											</td>
											<td className={cellClass}>
												<Text
													name={`field[${i}].values`}
													border={false}
													ring={false}
													defaultValue={
														field.values ? field.values.join(", ") : ""
													}
													disabled={field.type !== "radio"}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Label>
					<Submit />
				</Form> */}
		</div>
	);
}
