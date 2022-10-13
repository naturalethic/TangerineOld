import { capitalize, pluralize } from "inflection";
import { useState } from "react";
import { rid } from "~/lib/helper";
import { Collection, Tenant } from "~/lib/model";

import { Link } from "@remix-run/react";

import AddModal from "./AddModal";

interface SidebarProps {
    collections: Collection[];
    tenants: Tenant[];
}

export default function Sidebar({ collections, tenants }: SidebarProps) {
    const [addCollectionVisible, setAddCollectionVisible] = useState(false);
    const [addTenantVisible, setAddTenantVisible] = useState(false);

    return (
        <div>
            <ul className="menu rounded-box p-1 text-sm">
                <li>
                    <Link to="database">Database</Link>
                </li>
                <li>
                    <a href="/admin/authentication" data-turbo-frame="_top">
                        Authentication
                    </a>
                </li>
                <li className="menu-title flex flex-row mt-4 mb-2">
                    <div>Collections</div>
                    <div className="flex-1"></div>
                    <button
                        className="btn btn-xs modal-button"
                        onClick={() => setAddCollectionVisible(true)}
                    >
                        Add
                    </button>
                </li>
                {collections.map((collection) => (
                    <li key={collection.id}>
                        <Link to={`collection/${rid(collection)}?r`}>
                            {capitalize(pluralize(collection.name))}
                        </Link>
                    </li>
                ))}
                <li className="menu-title flex flex-row mt-4 mb-2">
                    <div>Tenants</div>
                    <div className="flex-1"></div>
                    <button
                        className="btn btn-xs modal-button"
                        onClick={() => setAddTenantVisible(true)}
                    >
                        Add
                    </button>
                </li>
                {tenants.map((tenant) => (
                    <li key={tenant.id}>
                        <Link to={`tenant/${rid(tenant)}?r`}>
                            {tenant.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <AddModal
                table="collection"
                visible={addCollectionVisible}
                singular
                lower
                template={new Collection()}
                onClose={() => setAddCollectionVisible(false)}
            />
            <AddModal
                table="tenant"
                visible={addTenantVisible}
                onClose={() => setAddTenantVisible(false)}
            />
        </div>
    );
}
