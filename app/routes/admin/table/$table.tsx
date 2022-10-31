import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { z } from "zod";
import { actionFunction, loaderFunction } from "~/lib/loader";

type LoaderData = { rows: any[] };

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db, params }) => ({
        // XXX: Injection danger
        rows: await db.query(`SELECT * FROM ${params.table}`),
    }))(args);

const ActionInput = z.object({
    ids: z.string(),
});

export const action: ActionFunction = (args) =>
    actionFunction(ActionInput, async ({ ids }, { db, method }) => {
        if (method === "DELETE") {
            for (const id of ids.split(",")) {
                await db.delete(id);
            }
        }
    })(args);

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
    const { rows } = useLoaderData<LoaderData>();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const fetcher = useFetcher();

    const onRowClick = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((i) => i !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    useHotkeys("esc", () => {
        setSelectedRows([]);
    });

    useHotkeys(
        "del, backspace",
        () => {
            if (selectedRows.length === 0) {
                return;
            }
            const ids = selectedRows.join(",");
            setSelectedRows([]);
            fetcher.submit({ ids }, { method: "delete" });
        },
        [selectedRows],
    );

    const selectedClass = "bg-blue-500 text-white";

    return (
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
                                selectedRows.includes(row.id) && selectedClass
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
    );
}
