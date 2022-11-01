import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { Form } from "remix-forms";
import { z } from "zod";
import { Flash } from "~/kit/flash";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Identity, Tenant } from "~/lib/types";

const Params = z.object({ identity: z.string() });

type LoaderData = { identity: Identity; tenants: Tenant[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db, params }) => {
        const identity = await db.select<Identity>(
            "_identity",
            Params.parse(params).identity,
        );
        identity.roles ??= {};
        return {
            identity,
            tenants: await db.query("SELECT * FROM _tenant ORDER BY name"),
        };
    })(args);

type IdentityInput = z.infer<typeof IdentityInput>;
const IdentityInput = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string().optional(),
    admin: z.boolean(),
    roles: z.string(),
});

export const action: ActionFunction = (args) =>
    actionFunction(IdentityInput, async (input, { db }) => {
        const identity: Partial<Identity> = {
            ...input,
            roles: JSON.parse(input.roles),
        };
        if (identity.password) {
            identity.password = await db.queryFirst(`
                SELECT * FROM crypto::argon2::generate('${identity.password}')
            `);
        } else {
            delete identity.password;
        }
        // XXX: `change` is preserving roles we want to remove.  Update would wipe out the password if not give.
        //      This relationship design sucks anyway.
        await db.change(identity as Identity);
        return {
            // XXX: Look into session.flash
            flash: "Record saved",
        };
    })(args);

export default function () {
    const { identity, tenants } = useLoaderData<LoaderData>();
    const action = useActionData();
    const values = {
        ...identity,
        password: "",
        roles: JSON.stringify(identity.roles ?? {}),
    };

    const componentRef = useRef<HTMLDivElement>(null);
    const updateRoles = () => {
        const selects = componentRef.current!.querySelectorAll("select");
        const roles: Record<string, string> = {};
        Array.from(selects).forEach((select) => {
            const tenant = select.dataset.tenant!;
            if (select.value) {
                roles[tenant] = select.value;
            }
        });
        const input: HTMLInputElement = componentRef.current!.querySelector(
            "input[name=roles]",
        )!;
        input.value = JSON.stringify(roles);
    };

    return (
        <div key={identity.id} ref={componentRef}>
            {action && action.flash && (
                <Flash level="info" message={action.flash} />
            )}
            <Form
                schema={IdentityInput}
                values={values}
                hiddenFields={["id", "roles"]}
                buttonLabel="Save"
                pendingButtonLabel="Save"
            >
                {({ Field, Errors, Button }) => (
                    <>
                        <Field name="id" />
                        <Field name="username" />
                        <Field name="password" />
                        <Field name="admin" />
                        <Field name="roles" />
                        <span className="flex flex-col mt-3">
                            <table className="mr-auto">
                                <thead className="text-left underline">
                                    <tr>
                                        <th className="pr-6 py-1">Tenant</th>
                                        <th className="pr-6 py-1">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id}>
                                            <td className="pr-6 py-1">
                                                {tenant.name}
                                            </td>
                                            <td>
                                                <select
                                                    data-tenant={tenant.id}
                                                    onChange={updateRoles}
                                                    defaultValue={
                                                        identity.roles[
                                                            tenant.id
                                                        ] ?? ""
                                                    }
                                                >
                                                    <option value="">
                                                        None
                                                    </option>
                                                    <option value="owner">
                                                        Owner
                                                    </option>
                                                    <option value="editor">
                                                        Editor
                                                    </option>
                                                    <option value="creator">
                                                        Creator
                                                    </option>
                                                    <option value="moderator">
                                                        Moderator
                                                    </option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </span>
                        <Errors />
                        <Button />
                    </>
                )}
            </Form>
        </div>
    );
}
