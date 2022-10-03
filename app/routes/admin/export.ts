import { LoaderFunction, Response } from "@remix-run/node";
import Zip from "jszip";
import { exec } from "shelljs";
import Database from "~/lib/database";

export const loader: LoaderFunction = async () => {
    const zip = new Zip();
    const databases = await Database.list();
    for (const database of databases) {
        zip.file(
            `Export/${database}.sql`,
            exec(
                `surreal export --conn http://localhost:8000 --user root --pass root --ns test --db ${database} /dev/stdout`,
                { silent: true },
            ).toString(),
        );
    }
    const content = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=Export.zip",
        },
    });
};