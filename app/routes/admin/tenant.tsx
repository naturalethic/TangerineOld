import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import {
    Link,
    useFetcher,
    useLoaderData,
    useParams,
    useSearchParams,
} from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { capitalize, pluralize } from "inflection";
import { Form, formAction } from "remix-forms";
import { Modal } from "~/kit";
import { db } from "~/lib/database";
import { unpackId } from "~/lib/helper";
import model from "~/lib/model";
import { Collection, Tenant } from "~/lib/types";

type LoaderData = { tenants: Tenant[]; collections: Collection[] };

export const loader: LoaderFunction = async ({ request }) => {
    const tenants = await model.tenant.all();
    const collections = await model.collection.all();
    return json({ tenants, collections });
};

export const action: ActionFunction = async ({ request }) =>
    formAction({
        request,
        schema: Tenant,
        mutation: makeDomainFunction(Tenant)(async (tenant) => {
            return await db.create("_tenant", tenant);
        }),
        successPath: (tenant: Tenant) => {
            return `/admin/tenant/${unpackId(tenant)}`;
        },
    });

export default function () {
    // const fetcher = useFetcher();
    const { tenants, collections } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mr-2 ml-2">
                <Link
                    className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36"
                    to="?action=create-tenant"
                >
                    NEW
                </Link>
                <div className="flex flex-col text-sm mt-4 flex-1">
                    {tenants.map((tenant) => (
                        <Link to={unpackId(tenant)} key={tenant.id}>
                            <div
                                className={`rounded px-2 mt-1 select-none cursor-pointer ${
                                    params.id === unpackId(tenant) &&
                                    "bg-orange-600 text-zinc-200"
                                }`}
                            >
                                {tenant.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex flex-col mr-2 ml-2">
                <div className="flex flex-col text-sm flex-1">
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
            <div className="flex-1 mx-2 flex flex-col space-y-3"></div>
            <Modal name="create-tenant" title="Create Tenant" focus="name">
                <Form
                    schema={Tenant}
                    values={{ name: "" }}
                    buttonLabel="Create"
                    pendingButtonLabel="Create"
                    hiddenFields={["id"]}
                />
            </Modal>
        </div>
    );
}
