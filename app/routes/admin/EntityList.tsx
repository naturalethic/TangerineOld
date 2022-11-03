import { Link } from "@remix-run/react";
import { capitalize, pluralize } from "inflection";
import { unpackId } from "~/lib/helper";

interface EntityList {
    children?: React.ReactNode;
    entities: any[];
    linkPrefix: string;
    labelProperty?: string;
    activePredicate: (entity: any) => boolean;
    pluralizeLabel?: boolean;
    capitalizeLabel?: boolean;
}

export function EntityList({
    children,
    entities,
    linkPrefix,
    labelProperty,
    activePredicate,
    pluralizeLabel = false,
    capitalizeLabel = false,
}: EntityList) {
    return (
        <div className="flex flex-col mr-2 ml-2">
            {children}
            <div className="h-2" />
            <div className="flex flex-col text-sm flex-1 border-zinc-500 w-36">
                {entities.map((entity) => {
                    const label = formatLabel(
                        labelProperty ? entity[labelProperty] : entity,
                        pluralizeLabel,
                        capitalizeLabel,
                    );
                    return (
                        <Link
                            to={`${linkPrefix}${
                                entity.id ? unpackId(entity) : entity
                            }`}
                            key={entity.id ?? entity}
                        >
                            <div
                                className={`rounded px-2 mt-1 select-none cursor-pointer ${
                                    activePredicate(entity) &&
                                    "bg-orange-600 text-zinc-200"
                                }`}
                            >
                                {!label.startsWith("_") && (
                                    <span className="invisible">_</span>
                                )}
                                {label}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function formatLabel(
    text: string,
    pluralizeLabel?: boolean,
    capitalizeLabel?: boolean,
) {
    if (capitalizeLabel) {
        text = capitalize(text);
    }
    if (pluralizeLabel) {
        text = pluralize(text);
    }
    return text;
}
