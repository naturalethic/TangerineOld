import { ActionFunction, json, redirect } from "@remix-run/node";
import { makeDomainFunction, toErrorWithMessage } from "domain-functions";
import { Form, performMutation } from "remix-forms";
import { z } from "zod";
import { db } from "~/lib/database.server";
import { unpackId } from "~/lib/helper";
import { getSession } from "~/lib/session.server";

type LoginForm = z.infer<typeof LoginForm>;
const LoginForm = z.object({
    username: z.string(),
    password: z.string(),
});

export const action: ActionFunction = async ({ request }) => {
    const result = await performMutation({
        request,
        schema: LoginForm,
        mutation: makeDomainFunction(LoginForm)(async (form) => {
            const identity = await db.query(
                `SELECT * FROM _identity WHERE username = '${form.username}' AND crypto::argon2::compare(password, '${form.password}')`,
                true,
            );
            if (identity) {
                const session = await getSession(request);
                session.set("identity", unpackId(identity.id));
                return session;
            } else {
                throw toErrorWithMessage("Invalid username or password");
            }
        }),
    });
    if (result.success) {
        return redirect("/", { headers: await result.data.commit() });
    }
    return json(result, { status: 401 });
};

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
