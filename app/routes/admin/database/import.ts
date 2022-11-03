import {
    ActionFunction,
    redirect,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
} from "@remix-run/node";
import Zip from "jszip";
import { withDb } from "~/lib/server/database.server";

export const action: ActionFunction = async ({ request }) => {
    const uploadHandler = await unstable_createMemoryUploadHandler();
    const form = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = form.get("file")! as File;
    const zip = await Zip.loadAsync(file.arrayBuffer());
    for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) {
            continue;
        }
        const database = /Export\/(.*)\.sql/.exec(name)?.[1];
        await withDb(async (db) => {
            await db.query(`REMOVE DATABASE ${database}`);
            await db.query(await file.async("string"));
        });
    }
    return redirect("/");
};
