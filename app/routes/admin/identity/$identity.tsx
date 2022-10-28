import type { LoaderFunction } from "@remix-run/node";
import { ActionFunction, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { Form, formAction } from "remix-forms";
import { z } from "zod";
import { Flash } from "~/kit/flash";
import { db } from "~/lib/database.server";
import { Identity } from "~/lib/types";

const Params = z.object({ identity: z.string() });

type LoaderData = { identity: Identity };

export const loader: LoaderFunction = async ({ params }) => {
    const { identity: id } = Params.parse(params);
    const identity = await db.select<Identity>("_identity", id);
    return json({ identity });
};

type IdentityInput = z.infer<typeof IdentityInput>;
const IdentityInput = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string().optional(),
    admin: z.boolean(),
});

export const action: ActionFunction = async ({ request }) =>
    formAction({
        request,
        // successPath: "/admin/identity",
        schema: IdentityInput,
        mutation: makeDomainFunction(IdentityInput)(async (identity) => {
            // return await db.create("_collection", collection);
            await db.update(identity);
            if (identity.password) {
                identity.password = (
                    await db.query(
                        `SELECT * FROM crypto::argon2::generate('${identity.password}')`,
                    )
                )[0];
            } else {
                delete identity.password;
            }
            await db.update(identity);
            return { flash: "Record saved" };
            // return (await db.query(
            //     `CREATE _identity SET username = '${identity.username}', password = crypto::argon2::generate('${identity.password}')`,
            //     true,
            // )) as Identity;
        }),
        // successPath: (collection: Collection) => {
        //     return `/admin/collection/${unpackId(collection)}`;
        // },
    });

export default function () {
    const { identity } = useLoaderData<LoaderData>();
    const action = useActionData();
    const values = { ...identity, password: "" };

    return (
        <div key={identity.id}>
            {action && action.flash && (
                <Flash level="info" message={action.flash} />
            )}
            <Form
                schema={IdentityInput}
                values={values}
                hiddenFields={["id"]}
                buttonLabel="Save"
                pendingButtonLabel="Save"
            />
        </div>
    );
}
