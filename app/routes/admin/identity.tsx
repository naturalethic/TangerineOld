import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Link,
    useFetcher,
    useLoaderData,
    useParams,
    useSearchParams,
} from "@remix-run/react";
import { useState } from "react";
import { EntityList } from "~/components/admin";
import { db } from "~/lib/database.server";
import { unpackId } from "~/lib/helper";
import { Identity } from "~/lib/types";

type LoaderData = { identities: Identity[] };

export const loader: LoaderFunction = async ({ request }) => {
    const identities = await db.query("SELECT id, username FROM _identity");
    // const tables = await db.tables();
    // const url = new URL(request.url);
    // let rows: any[] = [];
    // if (url.searchParams.has("name")) {
    //     rows = (await db.query(
    //         `SELECT * FROM ${url.searchParams.get("name")}`,
    //     )) as any[];
    // }
    return json({ identities });
};

export const action: ActionFunction = async ({ request }) => {
    // const url = new URL(request.url);
    // switch (url.searchParams.get("action")) {
    //     case "delete-rows": {
    //         const form = await request.formData();
    //         const table = form.get("table") as string;
    //         const ids = (form.get("ids") as string).split(",");
    //         console.log(table, ids);
    //         for (const id of ids) {
    //             await db.query(`DELETE FROM ${table} WHERE id = ${id}`);
    //         }
    //         return null;
    //     }
    // }
    throw json({ error: "Bad request" }, { status: 400 });
};

export default function () {
    const { identities } = useLoaderData<LoaderData>();
    const params = useParams();

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={identities}
                labelProperty="username"
                selectedPredicate={(identity) =>
                    params.identity === unpackId(identity)}
            />
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3" />
        </div>
    );
}
