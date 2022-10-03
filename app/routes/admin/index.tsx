import { LoaderFunction, json } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    return json({});
};

export default function IndexRoute() {
    return <h2>Dashboard</h2>;
}
