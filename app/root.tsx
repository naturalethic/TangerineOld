import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import styles from "./styles/app.css";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

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
                {/* add the UI you want your users to see */}
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
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
