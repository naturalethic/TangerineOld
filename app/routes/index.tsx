import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { loaderFunction } from "~/lib/loader";

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ identity }) => ({ identity }))(args);

export default function () {
    const { identity } = useLoaderData();

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-zinc-700">
            <div className="text-orange-600 text-6xl font-sacramento mb-10">
                Tangerine
            </div>
            {identity.admin && (
                <Link to="/admin" className="text-orange-600">
                    Admin
                </Link>
            )}
        </div>
    );
}
