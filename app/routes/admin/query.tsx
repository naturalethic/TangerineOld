import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { ChangeEventHandler, useState } from "react";
import { db } from "~/lib/database";

type LoaderData = {
    tables: string[];
};

export const loader: LoaderFunction = async () => {
    const tables = await db.tables();
    return json({ tables });
};

type ActionData = {
    result: string | null;
    error: string | null;
};

export const action: ActionFunction = async ({ request }) => {
    const data: ActionData = {
        result: null,
        error: null,
    };
    const form = await request.formData();
    const query = form.get("query") as string;
    try {
        data.result = JSON.stringify(await db.query(query), null, 4);
    } catch (e: any) {
        data.error = e.message;
    }
    return json(data);
};

export default function QueryRoute() {
    const [query, setQuery] = useState("");
    const [queries, setQueries] = useState<string[]>([]);
    const editor = useRef<HTMLTextAreaElement>(null);
    const action = useFetcher<ActionData>();
    const { tables } = useLoaderData<LoaderData>();
    const table = tables[0];

    const onQuerySelect: ChangeEventHandler<HTMLSelectElement> = (event) => {
        setQuery(event.target.selectedOptions[0].innerText);
        event.target.value = "";
        editor.current!.focus();
        setTimeout(() => {
            editor.current!.select();
        }, 1);
    };

    const onQueryChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        setQuery(event.target.value);
    };

    const file = useRef<HTMLInputElement>(null);

    const onImport = async () => {
        file.current!.click();
    };

    return (
        <div className="flex flex-col pr-4">
            <div className="tabs"></div>
            <div className="flex flex-row">
                <div className="flex-1">Content</div>
                <div className="flex flex-col bg-base-200 rounded p-4 w-48">
                    <div className="tabs">
                        <a className="tab tab-lifted tab-active">Tables</a>
                    </div>
                    <div className="bg-base-100">
                        <ul className="menu">
                            {tables.map((table) => (
                                <li key={table}>
                                    <a>{table}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    // return (
    //     <div className="flex flex-col space-y-4 flex-1">
    //         <div className="flex flex-row space-x-4">
    //             <Link to="/admin/query/export" className="btn" reloadDocument>
    //                 Export
    //             </Link>
    //             <action.Form
    //                 method="post"
    //                 className="hidden"
    //                 encType="multipart/form-data"
    //                 action="/admin/query/import"
    //             >
    //                 <input
    //                     type="file"
    //                     name="file"
    //                     ref={file}
    //                     onChange={(event) => event.target.form!.submit()}
    //                 />
    //             </action.Form>
    //             <button className="btn" onClick={onImport}>
    //                 Import
    //             </button>
    //         </div>
    //         <action.Form method="post" className="space-y-4">
    //             <label className="input-group input-group-vertical input-group-sm">
    //                 <span>QUERY HISTORY</span>
    //                 <select
    //                     className="select input-bordered"
    //                     onChange={onQuerySelect}
    //                 >
    //                     <option value="">Choose query...</option>
    //                     {queries.map((query) => (
    //                         <option key={query}>{query}</option>
    //                     ))}
    //                 </select>
    //             </label>
    //             <label className="input-group input-group-vertical input-group-sm">
    //                 <span>EDIT QUERY</span>
    //                 <textarea
    //                     name="query"
    //                     ref={editor}
    //                     className="textarea input-bordered"
    //                     rows={16}
    //                     value={query}
    //                     onChange={onQueryChange}
    //                 ></textarea>
    //             </label>
    //             <div className="form-control">
    //                 <button className="btn btn-primary">Submit</button>
    //             </div>
    //             {action.data && (
    //                 <>
    //                     {action.data.result && (
    //                         <div className="form-control">
    //                             <label className="label">
    //                                 <span className="label-text">Result</span>
    //                             </label>
    //                             <pre className="text-sm p-2 bg-neutral rounded">
    //                                 {action.data?.result}
    //                             </pre>
    //                         </div>
    //                     )}
    //                     {action.data.error && (
    //                         <div className="form-control">
    //                             <label className="label">
    //                                 <span className="label-text text-error">
    //                                     Error
    //                                 </span>
    //                             </label>
    //                             <pre className="text-error text-sm p-2 bg-neutral rounded">
    //                                 {action.data?.error}
    //                             </pre>
    //                         </div>
    //                     )}
    //                 </>
    //             )}
    //         </action.Form>
    //     </div>
    // );
}
