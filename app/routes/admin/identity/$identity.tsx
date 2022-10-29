import type { LoaderFunction } from "@remix-run/node";
import { ActionFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { useRef } from "react";
import { Form, formAction } from "remix-forms";
import { z } from "zod";
import { Flash } from "~/kit/flash";
import { db } from "~/lib/database.server";
import model from "~/lib/model";
import { Identity, Tenant } from "~/lib/types";

const Params = z.object({ identity: z.string() });

type LoaderData = { identity: Identity; tenants: Tenant[] };

export const loader: LoaderFunction = async ({ params }) => {
    const { identity: id } = Params.parse(params);
    const identity = await db.select<Identity>("_identity", id);
    identity.roles ??= {};
    const tenants = await model.tenant.all();
    return json({ identity, tenants });
};

type IdentityInput = z.infer<typeof IdentityInput>;
const IdentityInput = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string().optional(),
    admin: z.boolean(),
    roles: z.string(),
});

export const action: ActionFunction = async ({ request }) =>
    formAction({
        request,
        schema: IdentityInput,
        mutation: makeDomainFunction(IdentityInput)(async (input) => {
            const identity: Partial<Identity> = {
                ...input,
                roles: JSON.parse(input.roles),
            };
            if (identity.password) {
                identity.password = (
                    await db.query(
                        `SELECT * FROM crypto::argon2::generate('${identity.password}')`,
                    )
                )[0];
            } else {
                delete identity.password;
            }
            await db.update(identity as Identity);
            return { flash: "Record saved" };
        }),
    });

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
