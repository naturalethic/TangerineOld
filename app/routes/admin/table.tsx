import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Link,
    useFetcher,
    useLoaderData,
    useSearchParams,
} from "@remix-run/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { EntityList } from "~/components/admin";
import { withDb } from "~/lib/database.server";
// import { db } from "~/lib/database.server";
import { loaderFunction } from "~/lib/loader";

type LoaderData = { tables: string[]; rows: any[] };

export const loader: LoaderFunction = ({ request }) =>
    loaderFunction(async ({ db }) => {
        const info = await db.query("INFO FOR db");
        // const tables = Object.keys((await db.query("INFO FOR db")) as a .tb);
        // const url = new URL(request.url);
        // let rows: any[] = [];
        // if (url.searchParams.has("name")) {
        //     rows = (await db.query(
        //         `SELECT * FROM ${url.searchParams.get("name")}`,
        //     )) as any[];
        // }
        const tables: any[] = [];
        const rows: any[] = [];
        return {
            tables,
            rows,
        };
    })();

// export const loader: LoaderFunction = async ({ request }) => {
//     const tables = await db.tables();
//     const url = new URL(request.url);
//     let rows: any[] = [];
//     if (url.searchParams.has("name")) {
//         rows = (await db.query(
//             `SELECT * FROM ${url.searchParams.get("name")}`,
//         )) as any[];
//     }
//     return json({ tables, rows });
// };

export const action: ActionFunction = async ({ request }) => {
    return withDb(async (db) => {
        const url = new URL(request.url);
        switch (url.searchParams.get("action")) {
            case "delete-rows": {
                const form = await request.formData();
                const table = form.get("table") as string;
                const ids = (form.get("ids") as string).split(",");
                for (const id of ids) {
                    await db.query(`DELETE FROM ${table} WHERE id = ${id}`);
                }
                return null;
            }
        }
        throw json({ error: "Bad request" }, { status: 400 });
    });
};
//     const url = new URL(request.url);
//     // const successPath = url.pathname;
//     switch (url.searchParams.get("action")) {
//         case "query":
//             return formAction({
//                 request,
//                 schema: Query,
//                 mutation: makeDomainFunction(Query)(async (query) => {
//                     try {
//                         query.result = await db.query(query.statement);
//                     } catch (error: any) {
//                         query.error = JSON.parse(error.message);
//                     }
//                     return query;
//                 }),
//             });
//     }
//     throw json({ error: "Bad request" }, { status: 400 });
// };

const sortKeys = (keys: string[]) => {
    const sortedKeys = keys.sort((a, b) => {
        if (a === "id") {
            return -1;
        }
        if (b === "id") {
            return 1;
        }
        return a.localeCompare(b);
    });
    return sortedKeys;
};

export default function () {
    const { tables, rows } = useLoaderData<LoaderData>();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [search] = useSearchParams();
    const fetcher = useFetcher();

    // const file = useRef<HTMLInputElement>(null);

    // const onImport = async () => {
    //     file.current!.click();
    // };

    const onRowClick = (id: string) => {
        if (selectedRows.includes(id)) {
            // setSelectedRows((from) => from.filter((i) => i !== id));
            setSelectedRows(selectedRows.filter((i) => i !== id));
        } else {
            // setSelectedRows((from) => [...from, id]);
            setSelectedRows([...selectedRows, id]);
        }
    };

    useHotkeys(
        "del, backspace",
        () => {
            if (selectedRows.length === 0) {
                return;
            }
            const ids = selectedRows.join(",");
            setSelectedRows([]);
            fetcher.submit(
                {
                    table: search.get("name") as string,
                    ids,
                },
                { method: "post", action: "/admin/table?action=delete-rows" },
            );
        },
        [selectedRows],
    );

    useHotkeys("esc", () => {
        setSelectedRows([]);
    });

    const selectedClass = "bg-blue-500 text-white";

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <EntityList
                entities={tables}
                linkPrefix="/admin/table?name="
                activePredicate={(table) => table === search.get("name")}
            />
            <div className="bg-zinc-600 w-px h-full" />
            <div className="ml-2 mr-2 bg-zinc-800 rounded pb-4 pt-8 h-full w-full overflow-auto scrollbar-thin scrollbar-thumb-orange-900 relative">
                <table className="table-auto border-collapse text-sm w-full">
                    {rows.length > 0 && (
                        <thead>
                            <tr>
                                {sortKeys(Object.keys(rows[0])).map((key) => (
                                    <th
                                        key={key}
                                        className="border-b border-zinc-600 p-4 pl-8 pt-0 pb-3 text-zinc-200 text-left"
                                    >
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {rows.map((row: any) => (
                            <tr
                                key={row.id}
                                className={`text-zinc-400 ${
                                    selectedRows.includes(row.id) &&
                                    selectedClass
                                }`}
                                onClick={() => onRowClick(row.id)}
                            >
                                {sortKeys(Object.keys(row)).map((key) => (
                                    <td
                                        key={key}
                                        className={
                                            "border-b border-zinc-700 p-4 pl-8 select-text"
                                        }
                                    >
                                        {key === "id"
                                            ? row[key].split(":")[1]
                                            : JSON.stringify(row[key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {selectedRows.length > 0 && (
                    <div className="flex flex-row justify-center absolute bottom-4 w-full">
                        <div className="bg-zinc-500 text-sm rounded-xl px-4 py-px">
                            {selectedRows.length} row
                            {selectedRows.length > 1 && "s"} selected
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
