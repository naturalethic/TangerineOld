import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { makeDomainFunction } from 'domain-functions';
import { useEffect, useRef, useState } from 'react';
import { formAction } from 'remix-forms';
import Table from '~/components/admin/database/table';
import { FullTabs, Item, RoundedTabs } from '~/kit';
import { db } from '~/lib/database';
import { getStorage, setStorage } from '~/lib/storage';
import { Query } from '~/lib/types';

type LoaderData = { tables: string[] };

export const loader: LoaderFunction = async () => {
    const tables = await db.tables();
    return json({ tables });
};

// export const action: ActionFunction = async ({ request }) => {
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

export default function DatabaseRoute() {
    const { tables } = useLoaderData<LoaderData>();

    // const file = useRef<HTMLInputElement>(null);

    // const onImport = async () => {
    //     file.current!.click();
    // };

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mr-2 ml-2">
                <div className="flex flex-col text-sm flex-1 border-zinc-500 w-36">
                    {tables.map((table) => (
                        <div
                            key={table}
                            className="px-2 py-1 text-orange-200 cursor-pointer"
                        >
                            <a
                            // onClick={() => onTableMenuClick(table)}
                            >
                                {!table.startsWith("_") && (
                                    <span className="invisible">_</span>
                                )}
                                {table}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3">
                Table Detail
            </div>
        </div>
    );
}
