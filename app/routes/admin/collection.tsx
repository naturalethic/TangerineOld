import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { capitalize, pluralize, singularize } from "inflection";
import { useEffect, useRef, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { Select, SelectItem } from "~/components/select";
import { RoundedTabs, Tab } from "~/components/tabs";
import { db } from "~/lib/database";
import { Collection } from "~/lib/model";
import { Field } from "~/lib/types";

type LoaderData = {
    collections: Collection[];
};

export const loader: LoaderFunction = async () => {
    const collections = await Collection.all();
    return json({ collections });
};

export default function CollectionRoute() {
    const { collections } = useLoaderData<LoaderData>();
    const action = useFetcher();

    const onClickNew = () => {
        const name = prompt("Collection name");
        if (name) {
            action.submit(
                { name: singularize(name).toLowerCase() },
                { method: "post", action: "/admin/collection/create" },
            );
        }
    };

    const [collection, setCollection] = useState<Collection | null>(
        collections[0] || null,
    );

    useEffect(() => {
        setCollection(collections.find((c) => c.id === collection?.id) || null);
    }, [collections]);

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mt-2 mr-2">
                <div className="h-6 flex flex-row items-center">
                    <RoundedTabs value="collections">
                        <Tab label="Collections" value="collections" />
                    </RoundedTabs>
                </div>
                <div className="flex flex-col text-sm ml-2 mt-4 space-y-1 bg-zic-800 flex-1 border-zinc-500">
                    {collections.map((item) => (
                        <div
                            className={`rounded px-2 select-none cursor-pointer ${
                                collection?.name === item.name &&
                                "bg-zinc-400 text-zinc-700"
                            }`}
                            key={item.name}
                            onClick={() => setCollection(item)}
                        >
                            {pluralize(capitalize(item.name))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full"></div>
            <div className="flex-1 mx-2 mt-2 flex flex-col">
                <div className="flex flex-row items-center">
                    <div
                        className="text-xs mr-2 ml-1 border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer"
                        onClick={onClickNew}
                    >
                        NEW
                    </div>
                    <div>
                        {collection && pluralize(capitalize(collection.name))}
                    </div>
                </div>
                <div className="flex-1">
                    {collection && <CollectionEditor collection={collection} />}
                </div>
            </div>
        </div>
    );
}

interface CollectionEditorProps {
    collection: Collection;
}

function CollectionEditor({ collection }: CollectionEditorProps) {
    const [fields, setFields] = useState<Field[]>(collection.fields);

    const onAddField = () => {
        setFields([
            ...fields,
            { name: Math.random().toString(), type: "text" },
        ]);
    };

    const cellClass = "border border-zinc-600 px-2 py-1";

    return (
        <div className="flex flex-col h-full relative pt-2" key={collection.id}>
            <div className="flex flex-col bg-zinc-800 rounded h-full px-4 py-4">
                <Form action="/admin/collection/update">
                    <Hidden name="id" value={collection.id} />
                    <Label label="name">
                        <Text name="name" defaultValue={collection.name} />
                    </Label>
                    <Label label="fields" onAdd={onAddField}>
                        <div className="flex flex-col rounded bg-zinc-500 pt-3 text-sm">
                            <table className="text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="font-normal px-3">
                                            Name
                                        </th>
                                        <th className="font-normal px-3">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-zinc-800">
                                    {fields.map((field, i) => (
                                        <tr
                                            key={field.name}
                                            className="last:border-b"
                                        >
                                            <td className={cellClass}>
                                                <Text
                                                    name={`field.${i}.name`}
                                                    defaultValue={field.name}
                                                    border={false}
                                                    ring={false}
                                                />
                                            </td>
                                            <td className={cellClass}>
                                                <Select
                                                    value="text"
                                                    onChange={() => {}}
                                                >
                                                    <SelectItem
                                                        value="text"
                                                        label="Text"
                                                    />
                                                    <SelectItem
                                                        value="number"
                                                        label="Number"
                                                    />
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Label>
                    <Submit />
                </Form>
            </div>
        </div>
    );
}

interface FormProps {
    children: React.ReactNode;
    action: string;
}

function Form({ children, action }: FormProps) {
    const fetcher = useFetcher();
    const form = useRef<HTMLFormElement>(null);

    const onSubmit = function (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        fetcher.submit(form.current);
    };

    return (
        <fetcher.Form
            className="flex flex-col space-y-4"
            onSubmit={onSubmit}
            action={action}
            method="post"
            ref={form}
        >
            {children}
        </fetcher.Form>
    );
}

interface LabelProps {
    children?: React.ReactNode;
    label: string;
    onAdd?: () => void;
}

function Label({ children, label, onAdd }: LabelProps) {
    return (
        <label>
            <div className="px-2 pb-1 text-zinc-400 flex flex-row items-center space-x-1">
                <div>{capitalize(label)}</div>
                {onAdd && (
                    <MdAddCircle className="cursor-pointer" onClick={onAdd} />
                )}
            </div>
            {children}
        </label>
    );
}

interface TextProps {
    name: string;
    defaultValue: string;
    border?: boolean;
    ring?: boolean;
}

function Text({ name, defaultValue, border = true, ring = true }: TextProps) {
    let className =
        "bg-zinc-800 text-zinc-400 rounded px-2 py-1 border-zinc-500 w-full ring-0 outline-0";
    if (border) {
        className += " border";
    }
    if (ring) {
        className += " focus:ring-1 focus:ring-zinc-400";
    }
    return (
        <input
            className={className}
            type="text"
            name={name}
            defaultValue={defaultValue}
        />
    );
}

interface HiddenProps {
    name: string;
    value: string;
}

function Hidden({ name, value }: HiddenProps) {
    return <input type="hidden" name={name} value={value} />;
}

interface SubmitProps {
    label?: string;
}

function Submit({ label = "Submit" }: SubmitProps) {
    return (
        <button className="bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-500">
            {label}
        </button>
    );
}
