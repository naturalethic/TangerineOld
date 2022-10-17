import type { LoaderFunction } from "@remix-run/node";
import { ActionFunction, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { capitalize, pluralize } from "inflection";
import { Form, formAction } from "remix-forms";
import { Modal } from "~/kit";
import { db } from "~/lib/database";
import { unpackId } from "~/lib/helper";
import model from "~/lib/model";
import { Collection } from "~/lib/types";

type LoaderData = { collections: Collection[] };

export const loader: LoaderFunction = async ({ request }) => {
    const collections = await model.collection.all();
    return json({ collections });
};

export const action: ActionFunction = async ({ request }) =>
    formAction({
        request,
        schema: Collection,
        mutation: makeDomainFunction(Collection)(async (collection) => {
            return await db.create("_collection", collection);
        }),
        successPath: (collection: Collection) => {
            return `/admin/collection/${unpackId(collection)}`;
        },
    });

export default function CollectionRoute() {
    const { collections } = useLoaderData<LoaderData>();

    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mr-2 ml-2">
                <Link
                    className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36"
                    to="?action=create-collection"
                >
                    NEW
                </Link>
                <div className="flex flex-col text-sm mt-4 flex-1 border-zinc-500">
                    {collections.map((collection) => (
                        <Link to={unpackId(collection)} key={collection.id}>
                            <div
                                className={`rounded px-2 mt-1 select-none cursor-pointer ${
                                    params.id === unpackId(collection) &&
                                    "bg-orange-600 text-zinc-200"
                                }`}
                            >
                                {pluralize(capitalize(collection.name))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
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
