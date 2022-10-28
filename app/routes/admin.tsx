import { json, LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { getSession } from "~/lib/session.server";
import { Identity } from "~/lib/types";

export const loader: LoaderFunction = async ({ request }) => {
    const session = await getSession(request);
    const identity = (await session.identity()) as Identity;
    if (!identity.admin) {
        throw json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
};

export default function () {
    return (
        <div className="dark:bg-zinc-700 absolute inset-0 font-iosevka text-zinc-300">
            <div className="flex flex-row h-16 items-baseline mt-3">
                <div className="text-orange-600 text-3xl font-sacramento pl-6 pt-1 w-36">
                    Tangerine
                </div>
                <div className="flex-1 flex flex-row ml-2">
                    <MainLink to="/admin/database" label="Database" />
                    <MainLink to="/admin/query" label="Queries" />
                    <MainLink to="/admin/table" label="Tables" />
                    <MainLink to="/admin/collection" label="Collections" />
                    <MainLink to="/admin/tenant" label="Tenants" />
                    <MainLink to="/admin/identity" label="Identities" />
                    <div className="flex-1" />
                </div>
                <div className="w-64" />
            </div>
            <div className="absolute inset-0 mt-16">
                <Outlet />
            </div>
        </div>
    );
}

interface MainLinkProps {
    to: string;
    label: string;
}

function MainLink({ to, label }: MainLinkProps) {
    const route = useLocation().pathname;
    const activeClass = route.startsWith(to)
        ? "border-b border-orange-600"
        : "";
    return (
        <Link to={to} className={`mx-4 ${activeClass}`}>
            {label}
        </Link>
    );
}
