import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Form } from "remix-forms";
import { EntityList } from "~/components/admin";
import { Modal } from "~/kit";
import { unpackId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Tenant } from "~/lib/types";

type LoaderData = { tenants: Tenant[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        tenants: await db.query("SELECT * FROM _tenant ORDER BY name"),
    }))(args);

export const action: ActionFunction = (args) =>
    actionFunction(Tenant, async (input, { db }) => {
        const tenant = await db.create("_tenant", input);
        return redirect(`/admin/tenant/${unpackId(tenant)}`);
    })(args);

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
