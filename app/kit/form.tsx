import { useSubmit } from "@remix-run/react";
import { humanize } from "inflected";
import { FormEvent } from "react";

interface Text {
    name: string;
    value?: string;
    defaultValue?: string;
    label?: string;
    errors?: string[];
}

export function Text({ name, value, defaultValue, label, errors }: Text) {
    label ??= humanize(name.split(".").pop()!);
    return (
        <label className="flex flex-col">
            <div className="pl-2 text-zinc-400 flex flex-row items-center">
                <div>{label}</div>
            </div>
            <input
                type="text"
                name={name}
                value={value}
                defaultValue={defaultValue}
            />
            {errors && (
                <div role="alert" className="mt-1 pl-2">
                    {errors.map((error, i) => (
                        <div key={i}>{error}</div>
                    ))}
                </div>
            )}
        </label>
    );
}

interface Hidden {
    name: string;
    value?: string;
}

export function Hidden({ name, value }: Hidden) {
    return <input type="hidden" name={name} value={value} />;
}

interface Action {
    children: React.ReactNode;
    className?: string;
    primary?: boolean;
    name?: string;
    value?: string | number;
}

export function Action({
    children,
    className,
    primary = false,
    name = "submit",
    value,
}: Action) {
    const submit = useSubmit();
    className ??=
        "bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-500";
    return (
        <button
            className={className}
            name="action"
            value={name}
            type={primary ? "submit" : "button"}
            onClick={(event) => {
                const form = event.currentTarget.form!;
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "actionValue";
                input.value = value?.toString() ?? "";
                form.appendChild(input);
                submit(event.currentTarget);
                form.removeChild(input);
            }}
        >
            {children}
        </button>
    );
}

interface Select {
    children: React.ReactNode;
    name: string;
    label?: string;
    defaultValue?: string;
    onChange?: (event: FormEvent<HTMLSelectElement>) => void;
}

export function Select({
    children,
    name,
    label,
    defaultValue,
    onChange,
}: Select) {
    label ??= humanize(name.split(".").pop()!);
    return (
        <label className="flex flex-col">
            <div className="pl-2 text-zinc-400 flex flex-row items-center">
                <div>{label}</div>
            </div>
            <select name={name} defaultValue={defaultValue} onChange={onChange}>
                {children}
            </select>
        </label>
    );
}
