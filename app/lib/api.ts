import type {
    ActionFunction,
    AppData,
    DataFunctionArgs,
    Response,
} from "@remix-run/node";
import { json } from "@remix-run/node";

interface ActionArgs<T> extends DataFunctionArgs {
    input: T;
}

interface ActionHandler<T> {
    (args: ActionArgs<T>):
        | Promise<Response>
        | Response
        | Promise<AppData>
        | AppData;
}

interface Handlers<T> {
    patch?: ActionHandler<T>;
    post?: ActionHandler<T>;
    put?: ActionHandler<T>;
    delete?: ActionFunction;
}

export function createAction<T>(handlers: Handlers<T>): ActionHandler<T> {
    return async (args: ActionArgs<any>) => {
        if (["PATCH", "POST", "PUT"].includes(args.request.method)) {
            try {
                args.input = await args.request.json();
            } catch (error) {
                throw json({ error: "Bad request" }, { status: 400 });
            }
        }
        if (args.request.method === "PATCH" && handlers.patch) {
            return handlers.patch(args);
        }
        if (args.request.method === "POST" && handlers.post) {
            console.log(args.input);
            return handlers.post(args);
        }
        if (args.request.method === "PUT" && handlers.put) {
            return handlers.put(args);
        }
        if (args.request.method === "DELETE" && handlers.delete) {
            return handlers.delete(args);
        }
        throw json({ error: "Method not allowed" }, { status: 405 });
    };
}
