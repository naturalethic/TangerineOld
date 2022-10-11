import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { Select, SelectItem } from "~/components/Select";

export default function AdminRoute() {
    const route = useLocation().pathname;
    const navigate = useNavigate();

    return (
        <div className="dark:bg-zinc-700 absolute inset-0 font-iosevka text-zinc-300">
            <div className="flex flex-row h-16 items-center">
                <div className="text-orange-600 text-3xl font-sacramento pl-6 pt-1 w-64">
                    Tangerine
                </div>
                <div className="flex-1 flex flex-row justify-center">
                    <Select selectedItem={route} onChange={navigate}>
                        <SelectItem
                            label="Database Manager"
                            value="/admin/database"
                        />
                        <SelectItem
                            label="Collection Manager"
                            value="/admin/collection"
                        />
                        <SelectItem
                            label="Tenant Manager"
                            value="/admin/tenant"
                        />
                    </Select>
                </div>
                <div className="w-64"></div>
            </div>
            <div className="absolute inset-0 mt-16">
                <Outlet />
            </div>
        </div>
    );
}
