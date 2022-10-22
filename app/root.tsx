import {
    json,
    LinksFunction,
    LoaderFunction,
    MetaFunction,
    redirect,
} from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import { getSession } from "./lib/session.server";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "/style" }];
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "Tangerine",
    viewport: "width=device-width,initial-scale=1",
});

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    return (
        <html>
            <head>
                <title>Oh no!</title>
                <Meta />
                <Links />
            </head>
            <body>
                <Scripts />
            </body>
        </html>
    );
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    if (!["/login", "/signup"].includes(url.pathname)) {
        const session = await getSession(request);
        if (!session.get("identity")) {
            return redirect("/login", { headers: await session.commit() });
        }
    }
    return null;
};

export default function () {
    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="p-0 m-0">
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
