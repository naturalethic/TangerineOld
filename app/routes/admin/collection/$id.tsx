import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { setProperty } from "dot-prop";
import { useEffect, useRef, useState } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import { ReactSortable } from "react-sortablejs";
import Database from "~/lib/database";
import { inv, rid } from "~/lib/helper";
import { Collection } from "~/lib/model";
import type { Field, RadioField } from "~/lib/types";
import { fields } from "~/lib/types";

type LoaderData = {
    collection: Collection;
};

export const loader: LoaderFunction = async ({ params }) => {
    const id = inv(params.id, "Collection ID is required");
    const collection = await Database.meta.select<Collection>("collection", id);
    return json<LoaderData>({ collection });
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const collection = new Collection();
    for (const [key, value] of form.entries()) {
        setProperty(collection, key, value);
    }
    for (const field of collection.fields) {
        if (field.type === "radio") {
            field.values = (field as any).values
                .split(",")
                .map((it: string) => it.trim())
                .filter((it: string) => it);
        }
    }
    await Database.meta.update(collection);
    return null;
};

export default function CollectionRoute() {
    const { collection } = useLoaderData() as LoaderData;
    const action = useFetcher();
    const form = useRef<HTMLFormElement>(null);

    const onSave = () => {
        form.current!.submit();
    };

    const onDelete = () => {
        action.submit(
            { id: rid(collection), table: "collection" },
            { method: "post", action: "/admin/delete" },
        );
    };

    return (
        <div className="flex flex-col space-y-4">
            <action.Form method="post" ref={form}>
                <input type="hidden" name="id" value={collection.id} />
                <input type="hidden" name="name" value={collection.name} />
                <div className="flex flex-row space-x-4">
                    {/* <CollectionProperties collection={collection} /> */}
                    <CollectionFields collection={collection} />
                </div>
            </action.Form>
            <div className="flex flex-row">
                <div className="btn btn-xl w-64" onClick={onSave}>
                    Save
                </div>
                <div className="flex-1"></div>
                <div className="btn btn-xl" onClick={onDelete}>
                    <MdDelete size={24} />
                </div>
            </div>
        </div>
    );
}

interface CollectionPropertiesProps {
    collection: Collection;
}

function CollectionProperties({ collection }: CollectionPropertiesProps) {
    return (
        <div className="card bg-neutral" key={collection.id}>
            <div className="card-body">
                <label className="input-group input-group-vertical input-group-sm">
                    <span>NAME</span>
                    <input
                        type="text"
                        className="input input-bordered"
                        name="name"
                        defaultValue={collection.name}
                    />
                </label>
            </div>
        </div>
    );
}

interface CollectionFieldsProps {
    collection: Collection;
}

interface FieldItem {
    id: string;
    field: Field;
}

function CollectionFields({ collection }: CollectionFieldsProps) {
    const generateFieldItems = (fields: Field[]) => {
        return fields.map((field, i) => ({
            id: `${collection.id}-${i}`,
            field,
        }));
    };

    const [items, setItems] = useState<FieldItem[]>(
        generateFieldItems(collection.fields),
    );

    useEffect(() => {
        setItems(generateFieldItems(collection.fields));
    }, [collection]);

    const onAddField = () => {
        let name = "field1";
        let number = 1;
        while (items.some((item) => item.field.name === name)) {
            number++;
            name = `field${number}`;
        }
        setItems([
            ...items,
            {
                id: `${collection.id}-${items.length}`,
                field: { name, type: "text" },
            },
        ]);
    };

    const onDeleteField = (index: number) => {
        items.splice(index, 1);
        setItems([...items]);
    };

    return (
        <div className="card bg-neutral flex-1">
            <div className="card-body">
                <div className="card-title">
                    <div className="btn bg-base-200" onClick={onAddField}>
                        Add field
                    </div>
                </div>
                <div className="flex flex-col collection-field-editors">
                    <ReactSortable list={items} setList={setItems}>
                        {items.map((item, i) => (
                            <FieldEdit
                                key={item.id}
                                initialField={item.field}
                                index={i}
                                onDelete={() => onDeleteField(i)}
                            />
                        ))}
                    </ReactSortable>
                </div>
            </div>
        </div>
    );
}

interface FieldEditProps {
    initialField: Field;
    index: number;
    onDelete: () => void;
}

function FieldEdit({ initialField, index, onDelete }: FieldEditProps) {
    const [field, setField] = useState(initialField);

    const onChangeType = (type: Field["type"]) => {
        switch (type) {
        case "radio":
            setField({ name: field.name, type, values: [] });
            break;
        default:
            setField({ name: field.name, type });
        }
    };
    return (
        <div className="m-2 flex flex-row space-x-2 p-2 bg-slate-700 rounded">
            <label className="input-group input-group-vertical input-group-sm">
                <span className="relative">NAME</span>
                <input
                    type="text"
                    className="input text-primary-content"
                    name={`fields[${index}].name`}
                    defaultValue={field.name}
                />
            </label>
            <label className="input-group input-group-vertical input-group-sm">
                <span>TYPE</span>
                <select
                    className="select"
                    name={`fields[${index}].type`}
                    defaultValue={field.type}
                    onChange={(e) =>
                        onChangeType(e.target.value as Field["type"])
                    }
                >
                    {fields.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </label>
            {field.type === "radio" && (
                <RadioFieldEdit field={field} index={index} />
            )}
            <div className="flex flex-row items-start">
                <button className="opacity-40" onClick={onDelete}>
                    <MdClose />
                </button>
            </div>
        </div>
    );
}

interface RadioFieldEditProps {
    field: RadioField;
    index: number;
}

function RadioFieldEdit({ field, index }: RadioFieldEditProps) {
    return (
        <label className="input-group input-group-vertical input-group-sm">
            <span>VALUES</span>
            <input
                type="text"
                className="input input-bordered"
                name={`fields[${index}].values`}
                defaultValue={field.values.join(", ")}
            />
        </label>
    );
}
