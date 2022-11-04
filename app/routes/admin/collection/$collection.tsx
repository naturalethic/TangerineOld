import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { z } from "zod";
import { Action, Select, Text } from "~/kit";
import { packId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Collection, Field } from "~/lib/types";

const Params = z.object({ collection: z.string() });

type LoaderData = { collection: Collection };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db, params }) => {
        const id = packId("_collection", Params.parse(params).collection);
        return {
            collection: await db.select(id),
        };
    })(args);

const ActionParams = z.object({
    collection: z.string(),
});

const ActionInput = z.object({
    action: z.enum(["change", "create-field", "delete-field"]),
    actionValue: z.string().optional(),
    collection: z.object({
        name: z.string().min(1),
        fields: z.array(Field).optional(),
    }),
});

export const action: ActionFunction = (args) =>
    actionFunction(ActionInput, async (input, { params, method, db }) => {
        const p = ActionParams.parse(params);
        const collection = await db.select<Collection>(
            "_collection",
            p.collection,
        );
        Object.assign(collection, input.collection);
        switch (input.action) {
            case "change": {
                await db.change(collection);
                break;
            }
            case "create-field": {
                let i = 1;
                while (collection.fields.find((f) => f.name === `field${i}`)) {
                    i++;
                }
                collection.fields.push({ name: `field${i}`, type: "text" });
                await db.update(collection);
                break;
            }
            case "delete-field": {
                collection.fields.splice(Number(input.actionValue), 1);
                await db.update(collection);
                break;
            }
        }
    })(args);

export default function () {
    const { collection } = useLoaderData<LoaderData>();

    return (
        <div className="overflow-auto bg-zinc-800 rounded h-full px-4 py-4">
            <Form key={collection.id} method="post" className="flex flex-col ">
                <Text
                    name="collection[name]"
                    label="Name"
                    defaultValue={collection.name}
                />
                <div className="mt-4">Fields</div>
                <Action
                    className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36 mt-2"
                    name="create-field"
                >
                    NEW
                </Action>
                <div className="flex flex-col space-y-2 text-sm mt-2">
                    {collection.fields.map((field, index) =>
                        (
                            // XXX: Deal with duplicate field names
                            <FieldItem
                                key={field.name}
                                field={field}
                                index={index}
                            />
                        ),
                    )}
                </div>
                <Action name="change" primary={true}>
                    Save
                </Action>
            </Form>
        </div>
    );
}

interface FieldItem {
    field: Field;
    index: number;
    onDelete?: () => void;
}

function FieldItem({ field, index, onDelete }: FieldItem) {
    const [type, setType] = useState(field.type);

    return (
        <div className="flex flex-row space-x-3 border border-zinc-500 rounded px-2 py-2 bg-zinc-700 items-center group">
            <Text
                name={`collection[fields][${index}][name]`}
                label="Name"
                defaultValue={field.name}
            />
            <Select
                name={`collection[fields][${index}][type]`}
                label="Type"
                defaultValue={field.type}
                onChange={(e) => setType((e.target as HTMLSelectElement).value)}
            >
                <option value="checkbox">Checkbox</option>
                <option value="text">Text</option>
                <option value="radio">Radio</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="datetime">Datetime</option>
            </Select>
            {type === "radio" && (
                <Text
                    name={`collection[fields][${index}][values]`}
                    label="Values"
                    defaultValue={field.values?.join(",")}
                />
            )}
            <div className="flex-1" />
            <Action
                name="delete-field"
                value={index}
                className="text-2xl invisible group-hover:visible"
            >
                <MdDeleteForever />
            </Action>
        </div>
    );
}
