import {
    ActionFunction,
    redirect,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
} from "@remix-run/node";
import Zip from "jszip";
import { exec } from "shelljs";
import Database from "~/lib/database";

export const action: ActionFunction = async ({ request }) => {
    console.log("IMPORT");
    const uploadHandler = await unstable_createMemoryUploadHandler();
    const form = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = form.get("file")! as File;
    const zip = await Zip.loadAsync(file.arrayBuffer());
    for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) {
            continue;
        }
        const database = /Export\/(.*)\.sql/.exec(name)?.[1];
        Database.meta.query(`REMOVE DATABASE ${database}`);
        const command = `surreal import --conn http://localhost:8000 --user root --pass root --ns test --db ${database} /dev/stdin`;
        console.info(command);
        const ps = exec(command, { async: true });
        ps.stdin!.write(await file.async("string"));
        ps.stdin!.end();
    }
    return redirect("/admin/query");
};
