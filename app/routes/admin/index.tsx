import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    return json({});
};

export default function () {
    return <h2>Dashboard</h2>;
}
