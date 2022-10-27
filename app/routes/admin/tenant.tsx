import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { Form, formAction } from "remix-forms";
import { EntityList } from "~/components/admin";
import { Modal } from "~/kit";
import { db } from "~/lib/database.server";
import { unpackId } from "~/lib/helper";
import model from "~/lib/model";
import { Tenant } from "~/lib/types";

type LoaderData = { tenants: Tenant[] };

export const loader: LoaderFunction = async ({ request }) => {
    const tenants = await model.tenant.all();
    return json({ tenants });
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
    const { tenants } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={tenants}
                linkPrefix="/admin/tenant/"
                activePredicate={(tenant) => params.tenant === unpackId(tenant)}
                labelProperty="name"
            >
                <Link className="button" to="?action=create-tenant">
                    NEW TENANT
                </Link>
            </EntityList>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3">
                <Outlet />
            </div>
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
