import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { z } from "zod";
import { Action, Modal, Text } from "~/kit";
import { unpackId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Collection } from "~/lib/types";
import { EntityList } from "./EntityList";

type LoaderData = { collections: Collection[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        collections: await db.query(
            "SELECT * FROM _collection ORDER BY name ASC",
        ),
    }))(args);

const ActionInput = z.object({
    action: z.string(),
    name: z.string(),
});

export const action: ActionFunction = (args) =>
    actionFunction(ActionInput, async (input, { db }) => {
        const collection = await db.create("_collection", {
            name: input.name,
            fields: [],
        });
        return redirect(`/admin/collection/${unpackId(collection)}`);
    })(args);

export default function () {
    const { collections } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={collections}
                linkPrefix="/admin/collection/"
                activePredicate={(collection) =>
                    params.collection === unpackId(collection)}
                labelProperty="name"
                pluralizeLabel={true}
                capitalizeLabel={true}
            >
                <Link className="button" to="?action=create-collection">
                    NEW COLLECTION
                </Link>
            </EntityList>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col">
                <Outlet />
            </div>
            <Modal
                name="create-collection"
                title="Create Collection"
                focus="name"
            >
                <Form method="post">
                    <Text name="name" label="Name" />
                    <Action name="create">Create</Action>
                </Form>
            </Modal>
        </div>
    );
}
