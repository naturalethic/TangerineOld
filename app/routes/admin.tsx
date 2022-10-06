import { Outlet } from "@remix-run/react";
import { AiFillCaretDown } from "react-icons/ai";

export default function AdminRoute() {
    return (
        <div className="dark:bg-zinc-700 absolute inset-0 font-iosevka text-zinc-300">
            <div className="flex flex-row h-16 items-center">
                <div className="text-orange-600 text-3xl font-sacramento pl-6 pt-1 w-64">
                    Tangerine
                </div>
                <div className="text-sm flex-1 flex flex-row justify-center">
                    <div className="flex flex-row cursor-pointer select-none border pl-4 pr-2 py-1 rounded border-zinc-500">
                        <div>Database Manager</div>
                        <AiFillCaretDown className="mt-1" />
                    </div>
                </div>
                <div className="w-64"></div>
            </div>
            <div className="absolute inset-0 mt-16">
                <Outlet />
            </div>
        </div>
    );
}
