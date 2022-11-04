import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Action, Select, Text } from "~/kit/form";
import { packId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Collection, Field } from "~/lib/types";

const Params = z.object({ collection: z.string() });

type LoaderData = { collection: Collection };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db, params }) => {
        const id = packId("_collection", Params.parse(params).collection);
        const collection = await db.select<Collection>(id);
        return {
            collection,
        };
    })(args);

const ActionParams = z.object({
    collection: z.string(),
});

const ActionInput = z.object({
    action: z.enum(["change", "create-field"]),
    collection: z.object({
        name: z.string().min(1),
        fields: z.array(Field),
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
                collection.fields.push({ name: "New Field", type: "text" });
                await db.update(collection);
                break;
            }
        }
    })(args);

export default function () {
    const { collection } = useLoaderData<LoaderData>();

    return (
        <Form
            key={collection.id}
            method="post"
            className="flex flex-col bg-zinc-800 rounded h-full px-4 py-4"
        >
            <Text
                name="collection[name]"
                label="Name"
                defaultValue={collection.name}
            />
            <div className="mt-4">Fields</div>
            <Action
                className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36 mt-2"
                value="create-field"
                label="NEW"
            />
            {collection.fields.map((field, i) => (
                <div key={i} className="flex flex-row space-x-3">
                    <Text
                        name={`collection[fields][${i}][name]`}
                        label="Name"
                        defaultValue={field.name}
                    />
                    <Select
                        name={`collection[fields][${i}][type]`}
                        label="Type"
                        defaultValue={field.type}
                    >
                        <option value="checkbox">Checkbox</option>
                        <option value="text">Text</option>
                        <option value="radio">Radio</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="datetime">Datetime</option>
                    </Select>
                </div>
            ))}
            <Action value="change" label="Save" />
        </Form>
    );
}
