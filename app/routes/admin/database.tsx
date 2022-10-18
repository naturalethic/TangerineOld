import { Link, useFetcher } from "@remix-run/react";
import { useRef } from "react";

export default function () {
    const fetcher = useFetcher();

    const file = useRef<HTMLInputElement>(null);

    const onImportClick = async () => {
        file.current!.click();
    };

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mr-2 ml-2">
                <div className="flex flex-col text-sm flex-1 w-36 space-y-2">
                    <Link
                        className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36"
                        to="/admin/database/export"
                        reloadDocument={true}
                    >
                        EXPORT
                    </Link>
                    <div
                        className="text-xs border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer text-center w-36"
                        onClick={onImportClick}
                    >
                        IMPORT
                    </div>
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 flex flex-col space-y-3">
                <fetcher.Form
                    method="post"
                    className="hidden"
                    encType="multipart/form-data"
                    action="/admin/database/import"
                >
                    <input
                        type="file"
                        name="file"
                        ref={file}
                        onChange={(event) => event.target.form!.submit()}
                    />
                </fetcher.Form>
            </div>
        </div>
    );
}
