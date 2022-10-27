import type { LoaderFunction } from "@remix-run/node";
import { ActionFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { db } from "~/lib/database.server";
import model from "~/lib/model";
import { Identity } from "~/lib/types";

const Params = z.object({ identity: z.string() });

type LoaderData = { identity: Identity };

export const loader: LoaderFunction = async ({ params }) => {
    const { identity: id } = Params.parse(params);
    const identity = await db.select<Identity>("_identity", id);
    return json({ identity });
};

export default function () {
    const { identity } = useLoaderData<LoaderData>();

    return <div>{identity.username}</div>;
}
