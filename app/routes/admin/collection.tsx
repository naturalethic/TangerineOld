import {
    ActionFunction,
    json,
    LoaderFunction,
    redirect,
} from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { Form, formAction } from "remix-forms";
import { EntityList } from "~/components/admin";
import { Modal } from "~/kit";
import { unpackId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Collection } from "~/lib/types";

type LoaderData = { collections: Collection[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        collections: await db.query(
            "SELECT * FROM _collection ORDER BY name ASC",
        ),
    }))(args);

export const action = actionFunction(Collection, async (collection, { db }) => {
    await db.create("_collection", collection);
    throw redirect(`/admin/collection/${unpackId(collection)}`);
});

// export const action: ActionFunction = async ({ request }) =>
//     formAction({
//         request,
//         schema: Collection,
//         mutation: makeDomainFunction(Collection)(async (collection) => {
//             return await db.create("_collection", collection);
//         }),
//         successPath: (collection: Collection) => {
//             return `/admin/collection/${unpackId(collection)}`;
//         },
//     });

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
                <Form
                    schema={Collection}
                    values={{ name: "" }}
                    buttonLabel="Create"
                    pendingButtonLabel="Create"
                    hiddenFields={["id"]}
                />
            </Modal>
        </div>
    );
}
