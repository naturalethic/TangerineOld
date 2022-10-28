import {
    ActionFunction,
    json,
    LoaderFunction,
    redirect,
} from "@remix-run/node";
import { getSession } from "~/lib/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request);
    return redirect("/", { headers: await session.destroy() });
};
