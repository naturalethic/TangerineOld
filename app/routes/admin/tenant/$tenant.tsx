import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Link,
    Outlet,
    useFetcher,
    useLoaderData,
    useParams,
} from "@remix-run/react";
// import { setProperty } from "dot-prop";
import { capitalize, pluralize } from "inflection";
import { useEffect, useRef, useState } from "react";
import { MdDelete } from "react-icons/md";
import { z } from "zod";
import { unpackId } from "~/lib/helper";
import { loaderFunction } from "~/lib/loader";
import { Collection, Field, Tenant } from "~/lib/types";

type LoaderData = {
    tenant: Tenant;
    collections: Collection[];
};

const Params = z.object({ tenant: z.string() });

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ db, params }) => ({
        tenant: await db.select("_tenant", Params.parse(params).tenant),
        collections: await db.select("_collection"),
    }))(args);

// export const action: ActionFunction = async ({ request }) => {
//     const form = await request.formData();
//     const tenant = new Tenant();
//     for (const [key, value] of form.entries()) {
//         setProperty(tenant, key, value);
//     }
//     await db.update(tenant);
//     return null;
// };

export default function () {
    const { tenant, collections } = useLoaderData() as LoaderData;
    const p = useParams();
    //     const [record, setRecord] = useState<TenantCollectionRecord | null>(
    //         new TenantCollectionRecord(tenant, collections[0]),
    //     );
    return (
        <div className="flex flex-row h-full">
            <div className="flex flex-col mr-2">
                <div className="flex flex-col text-sm flex-1">
                    {collections.map((collection) => (
                        <Link
                            to={`collection/${unpackId(collection)}`}
                            key={collection.id}
                        >
                            <div
                                className={`rounded px-2 mb-1 select-none cursor-pointer ${
                                    p.collection === unpackId(collection) &&
                                    "bg-orange-600 text-zinc-200"
                                }`}
                            >
                                {pluralize(capitalize(collection.name))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px" />
            <div className="ml-2">
                <Outlet />
            </div>
            {/* <div className="flex-1">
                    <TenantProperties tenant={tenant} />
                    <div className="divider"></div>
                    <TenantCollections
                        tenant={tenant}
                        collections={collections}
                        data={data}
                        onRecord={(record) => setRecord(record)}
                    />
                </div>
                <TenantCollectionRecordEdit record={record} /> */}
        </div>
    );
}

// interface TenantPropertiesProps {
//     tenant: Tenant;
// }

// function TenantProperties({ tenant }: TenantPropertiesProps) {
//     const action = useFetcher();

//     const form = useRef<HTMLFormElement>(null);

//     const onSave = () => {
//         form.current!.submit();
//     };

//     const onDelete = () => {
//         action.submit(
//             { id: rid(tenant), table: "_tenant" },
//             { method: "post", action: "/admin/delete" },
//         );
//     };

//     return (
//         <div className="space-y-4">
//             <action.Form method="post" ref={form}>
//                 <input type="hidden" name="id" value={tenant.id} />
//                 <label
//                     className="input-group input-group-vertical input-group-sm"
//                     style={{ marginTop: 0 }}
//                     key={tenant.id}
//                 >
//                     <span className="relative">TENANT NAME</span>
//                     <input
//                         type="text"
//                         name="name"
//                         className="input text-primary-content input-bordered"
//                         value={tenant.name}
//                     />
//                 </label>
//             </action.Form>
//             <div className="flex flex-row">
//                 <div className="btn btn-xl w-64" onClick={onSave}>
//                     Save
//                 </div>
//                 <div className="flex-1"></div>
//                 <div className="btn btn-xl" onClick={onDelete}>
//                     <MdDelete size={24} />
//                 </div>
//             </div>
//         </div>
//     );
// }

// interface TenantCollectionsProps {
//     tenant: Tenant;
//     collections: Collection[];
//     data: Record<string, Record<string, any>[]>;
//     onRecord: (record: TenantCollectionRecord) => void;
// }

// function TenantCollections({
//     tenant,
//     collections,
//     data,
//     onRecord,
// }: TenantCollectionsProps) {
//     const [collection, setCollection] = useState(
//         collections[0] || new Collection(),
//     );

//     useEffect(() => {
//         setCollection(collections[0] || new Collection());
//     }, [collections]);

//     return (
//         <div className="p-4 rounded bg-base-300">
//             <div className="tabs">
//                 {collections.map((c) => (
//                     <a
//                         className={`tab tab-lifted ${
//                             c.name === collection.name && "tab-active"
//                         }`}
//                         key={c.name}
//                         onClick={() => setCollection(c)}
//                     >
//                         {capitalize(pluralize(c.name))}
//                     </a>
//                 ))}
//             </div>
//             <div className="background p-4 bg-base-100">
//                 <button
//                     className="btn btn-xs bg-base-200"
//                     onClick={() =>
//                         onRecord(new TenantCollectionRecord(tenant, collection))
//                     }
//                 >
//                     Add {collection.name}
//                 </button>
//                 <div className="divider"></div>
//                 <table className="table table-compact">
//                     <thead>
//                         <tr>
//                             {collection.fields.map((f) => (
//                                 <th key={f.name}>{f.name}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data[collection.name].map((r, i) => (
//                             <tr key={i}>
//                                 {collection.fields.map((f) => (
//                                     <td key={f.name}>{r[f.name]}</td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// class TenantCollectionRecord {
//     tenant: Tenant;
//     collection: Collection;
//     data: Record<string, unknown>;

//     constructor(
//         tenant: Tenant,
//         collection: Collection,
//         data: Record<string, unknown> = {},
//     ) {
//         this.tenant = tenant;
//         this.collection = collection;
//         this.data = data;
//     }
// }

// interface TenantRecordProps {
//     record: TenantCollectionRecord | null;
// }

// function TenantCollectionRecordEdit({ record }: TenantRecordProps) {
//     const action = useFetcher();

//     return (
//         <div
//             className="ml-4 p-4 rounded bg-base-100 pt-0"
//             style={{ minWidth: "25%" }}
//         >
//             {record && (
//                 <action.Form method="post" action="/admin/tenant/record">
//                     <input
//                         type="hidden"
//                         name="table"
//                         value={record.collection.name}
//                     />
//                     <input
//                         type="hidden"
//                         name="tenant"
//                         value={"_" + rid(record.tenant)}
//                     />
//                     <div className="flex flex-col space-y-4">
//                         <div>
//                             {record.data.id ? "Edit" : "Add"}{" "}
//                             {capitalize(record.collection.name)}
//                         </div>
//                         {record.collection.fields.map((field) => (
//                             <FieldEdit
//                                 key={field.name}
//                                 field={field}
//                                 value={record.data[field.name]}
//                             />
//                         ))}
//                         <button className="btn">Add</button>
//                     </div>
//                 </action.Form>
//             )}
//         </div>
//     );
// }

// interface FieldEditProps {
//     field: Field;
//     value: any;
// }

// function FieldEdit({ field, value }: FieldEditProps) {
//     switch (field.type) {
//     case "radio":
//         return <RadioFieldEdit field={field} value={value} />;
//     default:
//         return <TextFieldEdit field={field} value={value} />;
//     }
// }

// function TextFieldEdit({ field, value }: FieldEditProps) {
//     return (
//         <label className="input-group input-group-vertical input-group-sm">
//             <span>{field.name}</span>
//             <input
//                 type="text"
//                 name={field.name}
//                 className="input text-primary-content input-bordered"
//                 value={value}
//             />
//         </label>
//     );
// }

// interface RadioFieldEditProps {
//     field: RadioField;
//     value: string;
// }

// function RadioFieldEdit({ field, value }: RadioFieldEditProps) {
//     return (
//         <div>
//             <label className="input-group input-group-vertical input-group-sm">
//                 <span>{field.name}</span>
//                 <div></div>
//             </label>
//             <div
//                 className="px-2"
//                 style={{
//                     borderColor: "#464C58",
//                     borderWidth: "1px",
//                     borderBottomLeftRadius: "0.5rem",
//                     borderBottomRightRadius: "0.5rem",
//                 }}
//             >
//                 {field.values.map((v) => (
//                     <div key={v} className="form-control">
//                         <label className="cursor-pointer label">
//                             <span className="label-text">{v}</span>
//                             <input
//                                 type="radio"
//                                 name={field.name}
//                                 className="radio"
//                             />
//                         </label>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }
