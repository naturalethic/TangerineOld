import { json, LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { Identity } from "~/lib/types";

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request);
    return await session.identity();
};

export default function () {
    const identity = useLoaderData<Identity>();

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
