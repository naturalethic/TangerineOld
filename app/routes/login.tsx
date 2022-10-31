import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { toErrorWithMessage } from "domain-functions";
import { Form } from "remix-forms";
import { z } from "zod";
import { unpackId } from "~/lib/helper";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Identity } from "~/lib/types";

type LoginForm = z.infer<typeof LoginForm>;
const LoginForm = z.object({
    username: z.string(),
    password: z.string(),
});

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ identity }) => {
        if (identity) {
            throw redirect("/");
        }
    })(args);

export const action: ActionFunction = (args) =>
    actionFunction(
        LoginForm,
        async ({ username, password }, { db, session }) => {
            const identity = await db.queryFirst<Identity>(
                `SELECT * FROM _identity WHERE username = '${username}' AND crypto::argon2::compare(password, '${password}')`,
            );
            if (identity) {
                session.set("identity", unpackId(identity.id));
                return redirect("/", { headers: await session.commit() });
            } else {
                throw toErrorWithMessage("Invalid username or password");
            }
        },
    )(args);

export default function () {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-zinc-700">
            <div className="text-orange-600 text-6xl font-sacramento mb-10">
                Tangerine
            </div>
            <Form
                schema={LoginForm}
                values={{ username: "admin", password: "admin" }}
                buttonLabel="Login"
                pendingButtonLabel="Login"
            />
        </div>
    );
}
