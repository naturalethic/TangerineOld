import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { ChangeEventHandler, useState } from "react";
import Database from "~/lib/database";
import type { Session } from "~/lib/types";

type LoaderData = {
    session: Session;
    databases: string[];
};

export const loader: LoaderFunction = async () => {
    const databases = await Database.list();
    const session = await Database.session();
    return json<LoaderData>({ session, databases });
};

type ActionData = {
    result: string | null;
    error: string | null;
};

export const action: ActionFunction = async ({ request }) => {
    const session = await Database.meta.select<Session>("session", "root");
    const data: ActionData = {
        result: null,
        error: null,
    };
    const form = await request.formData();
    const query = form.get("query") as string;
    const database = new Database("test", form.get("database") as string);
    try {
        data.result = JSON.stringify(await database.query(query), null, 4);
        if (session.queries.includes(query)) {
            session.queries.splice(session.queries.indexOf(query), 1);
        }
        session.queries.unshift(query);
        await Database.meta.update(session);
    } catch (e: any) {
        data.error = e.message;
    }
    return json(data);
};

export default function QueryRoute() {
    const { session, databases } = useLoaderData() as LoaderData;
    const [query, setQuery] = useState("");
    const [database, setDatabase] = useState("root");
    const editor = useRef<HTMLTextAreaElement>(null);
    const action = useFetcher<ActionData>();

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
        <div className="flex flex-col space-y-4 flex-1">
            <div className="flex flex-row space-x-4">
                <Link to="/admin/export" className="btn" reloadDocument>
                    Export
                </Link>
                <action.Form
                    method="post"
                    className="hidden"
                    encType="multipart/form-data"
                    action="/admin/import"
                >
                    <input
                        type="file"
                        name="file"
                        ref={file}
                        onChange={(event) => event.target.form!.submit()}
                    />
                </action.Form>
                <button className="btn" onClick={onImport}>
                    Import
                </button>
            </div>
            <action.Form method="post" className="space-y-4">
                <label className="input-group input-group-vertical input-group-sm">
                    <span>DATABASE</span>
                    <select
                        className="select input-bordered flex-1 mr-2"
                        name="database"
                    >
                        {databases.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="input-group input-group-vertical input-group-sm">
                    <span>QUERY HISTORY</span>
                    <select
                        className="select input-bordered"
                        onChange={onQuerySelect}
                    >
                        <option value="">Choose query...</option>
                        {session.queries.map((query) => (
                            <option key={query}>{query}</option>
                        ))}
                    </select>
                </label>
                <label className="input-group input-group-vertical input-group-sm">
                    <span>EDIT QUERY</span>
                    <textarea
                        name="query"
                        ref={editor}
                        className="textarea input-bordered"
                        rows={16}
                        value={query}
                        onChange={onQueryChange}
                    ></textarea>
                </label>
                <div className="form-control">
                    <button className="btn btn-primary">Submit</button>
                </div>
                {action.data && (
                    <>
                        {action.data.result && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Result</span>
                                </label>
                                <pre className="text-sm p-2 bg-neutral rounded">
                                    {action.data?.result}
                                </pre>
                            </div>
                        )}
                        {action.data.error && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-error">
                                        Error
                                    </span>
                                </label>
                                <pre className="text-error text-sm p-2 bg-neutral rounded">
                                    {action.data?.error}
                                </pre>
                            </div>
                        )}
                    </>
                )}
            </action.Form>
        </div>
    );
}
