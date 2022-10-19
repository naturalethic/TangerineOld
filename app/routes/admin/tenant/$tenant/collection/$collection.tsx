import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { setProperty } from "dot-prop";
import { capitalize, pluralize } from "inflection";
import { useEffect, useRef, useState } from "react";
import { MdDelete } from "react-icons/md";
import { z } from "zod";
import { db } from "~/lib/database";
import model from "~/lib/model";
import { Collection, Field, Tenant } from "~/lib/types";

type LoaderData = {
    tenant: Tenant;
    collection: Collection;
    records: Record<string, any>[];
};

const Params = z.object({ tenant: z.string(), collection: z.string() });

export const loader: LoaderFunction = async ({ params }) => {
    const { tenant: tenantId, collection: collectionId } = Params.parse(params);
    const tenant = await model.tenant.get(tenantId);
    const collection = await model.tenant.get(collectionId);
    // const records: Record<string, any>[] = await db.select(collection.name);
    const records: Record<string, any>[] = [];
    return json<LoaderData>({ tenant, collection, records });
};

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
    const { tenant, collection, records } = useLoaderData() as LoaderData;
    //     const [record, setRecord] = useState<TenantCollectionRecord | null>(
    //         new TenantCollectionRecord(tenant, collections[0]),
    //     );
    return (
        <div className="flex flex-row">
            <div className="button">NEW RECORD</div>
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
