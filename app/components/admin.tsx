import { Link } from "@remix-run/react";
import { unpackId } from "~/lib/helper";

interface EntityListProps {
    children?: React.ReactNode;
    entities: any[];
    labelProperty?: string;
    selectedPredicate: (entity: any) => boolean;
}

export function EntityList({
    children,
    entities,
    labelProperty,
    selectedPredicate,
}: EntityListProps) {
    return (
        <div className="flex flex-col mr-2 ml-2">
            <div>{{ children }}</div>
            <div className="h-2" />
            <div className="flex flex-col text-sm flex-1 border-zinc-500 w-36">
                {entities.map((entity) => (
                    <Link
                        to={`/admin/identity/${unpackId(entity)}`}
                        key={entity.id ?? entity}
                    >
                        <div
                            className={`rounded px-2 mt-1 select-none cursor-pointer ${
                                selectedPredicate(entity) &&
                                "bg-orange-600 text-zinc-200"
                            }`}
                        >
                            {labelProperty ? entity[labelProperty] : entity}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
