import { LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { JSONTree } from "react-json-tree";
import { z } from "zod";
import { actionFunction, loaderFunction } from "~/lib/loader";
import { Query } from "~/lib/types";

interface LoaderData {
    queries: Query[];
}

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db }) => ({
        queries: await db.query("SELECT * FROM _query ORDER BY created DESC"),
    }))(args);

const QueryInput = z.object({
    statement: z.string(),
});

export const action = actionFunction(
    QueryInput,
    async ({ statement }, { db }) => {
        try {
            const result = await db.query(statement);
            const extant = await db.queryFirst<Query>(
                "SELECT * FROM _query WHERE statement = $statement",
                { statement },
            );
            if (extant) {
                extant.created = new Date().toISOString();
                await db.change(extant);
            } else {
                await db.create("_query", {
                    created: new Date().toISOString(),
                    statement,
                });
            }
            return result;
        } catch (error: any) {
            return JSON.parse(error.message);
        }
    },
);

export default function () {
    const { queries } = useLoaderData<LoaderData>();
    const data = useActionData();
    const [statement, setStatement] = useState<string>("");

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mr-2 ml-2">
                <div className="flex flex-col text-sm flex-1 border-zinc-500 w-36">
                    {queries.map((query) => (
                        <div
                            key={query.statement}
                            className="rounded px-2 mt-1 select-none cursor-pointer truncate"
                            onClick={() => setStatement(query.statement)}
                        >
                            {query.statement}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3">
                <Form method="post" className="flex flex-col h-1/2 relative">
                    <textarea
                        className="bg-zinc-900 rounded py-1 px-2 h-full w-full resize-none"
                        value={statement}
                        name="statement"
                        onChange={(e) => setStatement(e.target.value)}
                    />
                    <div className="flex flex-row justify-end text-sm mt-2 absolute right-2 bottom-2">
                        <button
                            className="rounded bg-orange-600 text-zinc-200 px-2 py-px font-bold disabled:bg-zinc-400"
                            disabled={statement.length === 0}
                        >
                            Execute
                        </button>
                    </div>
                </Form>
                <div className="rounded py-1 px-2 bg-zinc-900 h-1/2 overflow-auto scrollbar-thin scrollbar-thumb-orange-900">
                    {data && (
                        <JSONTree
                            data={data}
                            shouldExpandNode={() => true}
                            theme={theme}
                            invertTheme={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const theme = {
    base00: "#18181A",
    base01: "#252525",
    base02: "#464646",
    base03: "#525252",
    base04: "#ababab",
    base05: "#b9b9b9",
    base06: "#e3e3e3",
    base07: "#f7f7f7",
    base08: "#7c7c7c",
    base09: "#999999",
    base0A: "#a0a0a0",
    base0B: "#8e8e8e",
    base0C: "#868686",
    base0D: "#686868",
    base0E: "#747474",
    base0F: "#5e5e5e",
};
