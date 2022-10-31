import {
    LinksFunction,
    LoaderFunction,
    MetaFunction,
    redirect,
} from "@remix-run/node";
import {
    Link,
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";
import { IoMdLogOut } from "react-icons/io";
import { loaderFunction } from "./lib/loader";

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

export const loader: LoaderFunction = (args) =>
    loaderFunction(async ({ session, identity, url }) => {
        if (["/login", "/signup"].includes(url.pathname)) {
            return {};
        }
        if (identity) {
            return { identity };
        }
        throw redirect("/login", { headers: await session.commit() });
    })(args);

// export const loader: LoaderFunction = async ({ request }) => {
//     const url = new URL(request.url);
//     if (!["/login", "/signup"].includes(url.pathname)) {
//         const session = await getSession(request);
//         if (!session.get("identity")) {
//             return redirect("/login", { headers: await session.commit() });
//         }
//         return await session.identity();
//     }
//     return null;
// };

export default function () {
    const { identity } = useLoaderData();

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
                {identity && (
                    <Link
                        to="/logout"
                        className="fixed text-orange-600 top-0 right-0 mr-2 mt-2"
                    >
                        <IoMdLogOut />
                    </Link>
                )}
            </body>
        </html>
    );
}
