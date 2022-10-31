import { LoaderFunction, redirect } from "@remix-run/node";
import { loaderFunction } from "~/lib/loader";

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ session }) => {
        throw redirect("/", { headers: await session.destroy() });
    })(args);
