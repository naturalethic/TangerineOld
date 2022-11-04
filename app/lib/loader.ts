import { DataFunctionArgs, json } from "@remix-run/node";
import { Params } from "@remix-run/react";
import { makeDomainFunction } from "domain-functions";
import { FormSchema, performMutation } from "remix-forms";
import { z } from "zod";
import { Connection, withDb } from "./server/database.server";
import { Session } from "./server/session.server";
import { Identity } from "./types";

interface Environment {
    db: Connection;
    session: Session;
    identity: Identity | null;
    url: URL;
    params: Params;
    method: string;
}

async function makeEnv(db: Connection, request: Request, params: Params) {
    const session = await Session.get(request);
    return {
        db,
        session,
        identity: await session.identity(),
        url: new URL(request.url),
        params,
        method: request.method,
    };
}

export function loaderFunction(
    fn: (environment: Environment) => Promise<unknown>,
) {
    return async ({ request, params }: DataFunctionArgs) =>
        withDb(async (db) => {
            return json((await fn(await makeEnv(db, request, params))) ?? {});
        });
}

export function actionFunction<Schema extends FormSchema>(
    schema: Schema,
    fn: (
        input: z.infer<typeof schema>,
        environment: Environment,
    ) => Promise<unknown>,
) {
    return async ({ request, params }: DataFunctionArgs) => {
        const mutation = makeDomainFunction(schema)(
            async (input) =>
                await withDb(async (db) => {
                    return (
                        (await fn(input, await makeEnv(db, request, params))) ??
                        {}
                    );
                }),
        );
        const result = await performMutation({ request, schema, mutation });

        if (result.success) {
            return result.data;
        } else {
            console.error(result.errors);
            return null;
        }
    };
}

export function formFunction<Schema extends z.ZodTypeAny>(
    schema: Schema,
    fn: (
        input: z.infer<typeof schema>,
        environment: Environment,
    ) => Promise<unknown>,
) {
    return async ({ request, params }: DataFunctionArgs) => {
        return await withDb(async (db) => {
            try {
                const input = schema.parse(await request.json());
                return (
                    (await fn(input, await makeEnv(db, request, params))) ?? {}
                );
            } catch (error) {
                return json({ error });
            }
        });
    };
}
