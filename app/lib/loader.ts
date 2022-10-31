import type { ActionFunction, DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { makeDomainFunction } from "domain-functions";
import type { FormSchema } from "remix-forms";
import { formAction } from "remix-forms";
import { z } from "zod";
import { Connection, withDb } from "./database.server";
import { Session } from "./session.server";
import { Identity } from "./types";

interface Environment {
    db: Connection;
    session: Session;
    identity: Identity | null;
    url: URL;
}

export function actionFunction<Schema extends FormSchema>(
    schema: Schema,
    fn: (
        input: z.infer<typeof schema>,
        environment: Environment,
    ) => Promise<unknown>,
) {
    return async ({ request }: DataFunctionArgs) =>
        formAction({
            request,
            schema,
            mutation: makeDomainFunction(schema)(
                async (input) =>
                    await withDb(async (db) => {
                        const session = await Session.get(request);
                        return (
                            (await fn(input, {
                                db,
                                session,
                                identity: await session.identity(),
                                url: new URL(request.url),
                            })) ?? {}
                        );
                    }),
            ),
        });
}

export function loaderFunction(
    fn: (environment: Environment) => Promise<unknown>,
) {
    return async ({ request }: DataFunctionArgs) =>
        withDb(async (db) => {
            const session = await Session.get(request);
            return json(
                (await fn({
                    db,
                    session,
                    identity: await session.identity(),
                    url: new URL(request.url),
                })) ?? {},
            );
        });
}
