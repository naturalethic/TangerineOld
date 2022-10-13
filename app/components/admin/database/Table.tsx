import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFetcher } from "@remix-run/react";

import type { ActionData } from "~/routes/admin/database/query";

interface Props {
    name: string;
    content: any;
    onChange: (content: any) => void;
}

export default function Table({ name, content, onChange }: Props) {
    const action = useFetcher<ActionData>();
    const [selectedRows, setSelectedRows] = useState(new Set<number>());

    const updateContent = () => {
        if (action.data) {
            onChange(action.data);
        } else {
            onChange([]);
        }
    };

    useEffect(updateContent, [action.data]);
    useEffect(() => {
        action.submit(
            { table: name },
            { method: "post", action: "/admin/database/table" },
        );
    }, []);

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

    const onRowClick = (index: number) => {
        if (selectedRows.has(index)) {
            selectedRows.delete(index);
        } else {
            selectedRows.add(index);
        }
        setSelectedRows(new Set(selectedRows));
    };

    useHotkeys("del", () => {
        if (selectedRows.size === 0) {
            return;
        }
        action.submit(
            {
                table: name,
                ids: Array.from(selectedRows)
                    .map((i) => content[i].id)
                    .join(","),
            },
            { method: "delete", action: "/admin/database/table" },
        );
    });

    const selectedClass = "bg-blue-500 text-white";

    return (
        <div className="flex flex-col h-full relative pt-2">
            <div className="flex flex-col bg-zinc-800 rounded pb-4 pt-8 h-full">
                <table className="table-auto border-collapse text-sm">
                    {content && content.length > 0 && (
                        <thead>
                            <tr>
                                {sortKeys(Object.keys(content[0])).map(
                                    (key) => (
                                        <th
                                            key={key}
                                            className="border-b border-zinc-600 p-4 pl-8 pt-0 pb-3 text-zinc-200 text-left"
                                        >
                                            {key}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {content &&
                            content.map((row: any, i: number) => (
                                <tr
                                    key={row.id}
                                    className={`text-zinc-400 ${
                                        selectedRows.has(i) && selectedClass
                                    }`}
                                    onClick={() => onRowClick(i)}
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
            </div>
            {selectedRows.size > 0 && (
                <div className="flex flex-row justify-center absolute bottom-4 w-full">
                    <div className="bg-zinc-500 text-sm rounded-xl px-4 py-px">
                        {selectedRows.size} row{selectedRows.size > 1 && "s"}{" "}
                        selected
                    </div>
                </div>
            )}
        </div>
    );
}
