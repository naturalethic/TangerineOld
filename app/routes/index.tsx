import { Link } from "@remix-run/react";

export default function Index() {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <div className="text-xl">Tangerine</div>
            <Link to="/admin" className="underline">
                Admin
            </Link>
        </div>
    );
}
