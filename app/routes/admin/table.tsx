import { LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { loaderFunction } from "~/lib/loader";
import { EntityList } from "./EntityList";

type LoaderData = { tables: string[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        tables: Object.keys(((await db.query("INFO FOR db")) as any).tb),
    }))(args);

export default function () {
    const { tables } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={tables}
                linkPrefix="/admin/table/"
                activePredicate={(table) => table === params.table}
            />
            <div className="bg-zinc-600 w-px h-full" />
            <Outlet />
        </div>
    );
}
