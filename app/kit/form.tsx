import { useFetcher } from "@remix-run/react";
import { capitalize } from "inflection";
import { useRef } from "react";
import { MdAddCircle } from "react-icons/md";

interface FormProps {
    children: React.ReactNode;
    action: string;
}

export function Form({ children, action }: FormProps) {
    const fetcher = useFetcher();
    const form = useRef<HTMLFormElement>(null);

    const onSubmit = function (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        fetcher.submit(form.current);
    };

    return (
        <fetcher.Form
            className="flex flex-col space-y-4"
            onSubmit={onSubmit}
            action={action}
            method="post"
            ref={form}
        >
            {children}
        </fetcher.Form>
    );
}

interface LabelProps {
    children?: React.ReactNode;
    label: string;
    onAdd?: () => void;
}

export function Label({ children, label, onAdd }: LabelProps) {
    return (
        <label>
            <div className="px-2 pb-1 text-zinc-400 flex flex-row items-center space-x-1">
                <div>{capitalize(label)}</div>
                {onAdd && (
                    <MdAddCircle className="cursor-pointer" onClick={onAdd} />
                )}
            </div>
            {children}
        </label>
    );
}

interface TextProps {
    name: string;
    defaultValue: string;
    border?: boolean;
    ring?: boolean;
    disabled?: boolean;
}

export function Text({
    name,
    defaultValue,
    border = true,
    ring = true,
    disabled = false,
}: TextProps) {
    let className =
        "bg-zinc-800 text-zinc-400 rounded px-2 py-1 border-zinc-500 w-full ring-0 outline-0";
    if (border) {
        className += " border";
    }
    if (ring) {
        className += " focus:ring-1 focus:ring-zinc-400";
    }
    return (
        <input
            className={className}
            type="text"
            name={name}
            defaultValue={defaultValue}
            disabled={disabled}
        />
    );
}

interface HiddenProps {
    name: string;
    value: string;
}

export function Hidden({ name, value }: HiddenProps) {
    return <input type="hidden" name={name} value={value} />;
}

interface SubmitProps {
    label?: string;
}

export function Submit({ label = "Submit" }: SubmitProps) {
    return (
        <button className="bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-500">
            {label}
        </button>
    );
}
