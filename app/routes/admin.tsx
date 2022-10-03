import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { capitalize, pluralize } from "inflection";
import { MdHandyman } from "react-icons/md";
import Sidebar from "~/components/admin/Sidebar";
import { rid } from "~/lib/helper";
import { Collection, Tenant } from "~/lib/model";

type LoaderData = {
    tenants: Tenant[];
    collections: Collection[];
    title: string;
};

export const loader: LoaderFunction = async ({ params }) => {
    const collections = await Collection.all();
    const tenants = await Tenant.all();
    let title = "";
    for (const it of collections) {
        if (rid(it) === (params.id as string)) {
            title = capitalize(pluralize(it.name));
        }
    }
    for (const it of tenants) {
        if (rid(it) === (params.id as string)) {
            title = it.name;
        }
    }
    return json<LoaderData>({ tenants, collections, title });
};

export default function AdminRoute() {
    const { tenants, collections, title } = useLoaderData() as LoaderData;
    return (
        <div className="flex flex-row p-4">
            <div className="flex flex-col mr-14">
                <div className="h-16 pl-4 pt-4">
                    <Link to="/admin">
                        <MdHandyman className="text-4xl" />
                    </Link>
                </div>
                <div className="h-4"></div>
                <div className="flex flex-row flex-1">
                    <div className="flex-1">
                        <Sidebar collections={collections} tenants={tenants} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <div className="h-16 flex flex-row items-center text-4xl">
                    {title}
                </div>
                <div className="h-4"></div>
                <Outlet />
            </div>
        </div>
    );
}
