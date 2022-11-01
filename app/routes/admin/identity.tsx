import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Form } from "remix-forms";
import { z } from "zod";
import { EntityList } from "~/components/admin";
import { Modal } from "~/kit";
import { unpackId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Identity } from "~/lib/types";

type LoaderData = { identities: Identity[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        identities: await db.query("SELECT id, username FROM _identity"),
    }))(args);

type IdentityInput = z.infer<typeof IdentityInput>;
const IdentityInput = z.object({
    username: z.string(),
    password: z.string(),
});

export const action: ActionFunction = (args) =>
    actionFunction(IdentityInput, async ({ username, password }, { db }) => {
        const identity = await db.queryFirst<Identity>(`
            CREATE _identity
               SET username = '${username}',
                   password = crypto::argon2::generate('${password}'),
                   admin = false,
                   roles = {}
        `);
        return redirect(`/admin/identity/${unpackId(identity)}`);
    })(args);

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
