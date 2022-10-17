import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { JSONTree } from 'react-json-tree';
import { z } from 'zod';
import { db } from '~/lib/database';
import { packId, unpackId } from '~/lib/helper';
import model from '~/lib/model';
import { Query } from '~/lib/types';

type LoaderData = { queries: Query[] };

export const loader: LoaderFunction = async () => {
    const queries = await model.query.all();
    return json({ queries });
};

export const action: ActionFunction = async ({ request }) => {
    const url = new URL(request.url);
    switch (url.searchParams.get("action")) {
        case "execute": {
            const form = await request.formData();
            const statement = form.get("statement") as string;
            try {
                const result = await db.query(statement);
                const extant = (await db.query(
                    `SELECT * FROM _query WHERE statement = '${statement}'`,
                    true,
                )) as Query;
                if (extant) {
                    extant.created = new Date().toISOString();
                    await db.update(extant);
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
        }
    }
    throw json({ error: "Bad request" }, { status: 400 });
};

export default function DatabaseRoute() {
    const [search] = useSearchParams();
    const { queries } = useLoaderData<LoaderData>();
    const [statement, setStatement] = useState<string>(
        search.has("id")
            ? queries.find((q) => q.id === packId("_query", search.get("id")!))!
                  .statement
            : "",
    );
    const fetcher = useFetcher();

    const execute = () => {
        fetcher.submit(
            { statement },
            {
                method: "post",
                action: "/admin/query?action=execute",
            },
        );
    };

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
                <div className="flex flex-col h-1/2 relative">
                    <textarea
                        className="bg-zinc-900 rounded py-1 px-2 h-full w-full resize-none"
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                    />
                    <div className="flex flex-row justify-end text-sm mt-2 absolute right-2 bottom-2">
                        <button
                            className="rounded bg-orange-600 text-zinc-200 px-2 py-px font-bold disabled:bg-zinc-400"
                            onClick={execute}
                            disabled={statement.length === 0}
                        >
                            Execute
                        </button>
                    </div>
                </div>
                <div className="rounded py-1 px-2 bg-zinc-900 overflow-auto h-1/2 scrollbar-thin scrollbar-thumb-orange-900">
                    {fetcher.data && (
                        <JSONTree
                            data={fetcher.data}
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
