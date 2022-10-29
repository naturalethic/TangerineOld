import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { Form, formAction } from "remix-forms";
import { z } from "zod";
import { EntityList } from "~/components/admin";
import { Modal } from "~/kit";
import { db } from "~/lib/database.server";
import { unpackId } from "~/lib/helper";
import { Identity } from "~/lib/types";

type LoaderData = { identities: Identity[] };

export const loader: LoaderFunction = async ({ request }) => {
    const identities = await db.query("SELECT id, username FROM _identity");
    return json({ identities });
};

type IdentityInput = z.infer<typeof IdentityInput>;
const IdentityInput = z.object({
    username: z.string(),
    password: z.string(),
});

export const action: ActionFunction = async ({ request }) =>
    formAction({
        request,
        schema: IdentityInput,
        mutation: makeDomainFunction(IdentityInput)(async (identity) => {
            return (await db.query(
                `
                CREATE _identity
                   SET username = '${identity.username}',
                       password = crypto::argon2::generate('${identity.password}'),
                       admin = false,
                       roles = {}
                `,
                true,
            )) as Identity;
        }),
        successPath: (identity: Identity) => {
            return `/admin/identity/${unpackId(identity)}`;
        },
    });

export default function () {
    const { identities } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={identities}
                labelProperty="username"
                linkPrefix="/admin/identity/"
                activePredicate={(identity) =>
                    params.identity === unpackId(identity)}
            >
                <Link className="button" to="?action=create-identity">
                    NEW IDENTITY
                </Link>
            </EntityList>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3">
                <Outlet />
            </div>
            <Modal
                name="create-identity"
                title="Create Identity"
                focus="username"
            >
                <Form
                    schema={IdentityInput}
                    // values={{ username: "" }}
                    buttonLabel="Create"
                    pendingButtonLabel="Create"
                >
                    {({ Field, Errors, Button }) => (
                        <>
                            <Field name="username" label="Username" />
                            <Field
                                name="password"
                                label="Password"
                                type="password"
                            />
                            <Button />
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
