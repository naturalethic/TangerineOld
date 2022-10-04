import { useFetcher } from "@remix-run/react";
import { singularize } from "inflection";
import { useEffect, useRef } from "react";
import { FormEvent } from "react";

interface AddModalProps {
    table: string;
    template?: object;
    visible: boolean;
    singular?: boolean;
    lower?: boolean;
    onClose: () => void;
}

export default function AddModal({
    table,
    visible,
    template = {},
    singular = false,
    lower = false,
    onClose,
}: AddModalProps) {
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible) {
            input.current!.value = "";
            input.current!.focus();
        }
    }, [visible]);

    const action = useFetcher();

    const onAdd = (event: FormEvent) => {
        event.preventDefault();
        let name = input.current!.value;
        if (singular) {
            name = singularize(name);
        }
        if (lower) {
            name = name.toLowerCase();
        }
        const record = JSON.stringify({ ...template, name });
        action.submit(
            { record },
            { method: "post", action: `/admin/${table}/add` },
        );
        onClose();
    };

    return (
        <div>
            <input
                type="checkbox"
                className="modal-toggle"
                checked={visible}
                readOnly
            />
            <div className="modal">
                <div className="modal-box">
                    <form onSubmit={onAdd}>
                        <h3 className="font-bld text-xl mb-4">Add {table}</h3>
                        <label className="input-group input-group-vertical input-group-sm">
                            <span>NAME</span>
                            <input
                                className="input input-bordered"
                                ref={input}
                            />
                        </label>
                        <div className="flex flex-row mt-6">
                            <a className="btn w-32" onClick={onClose}>
                                Cancel
                            </a>
                            <div className="flex-1"></div>
                            <button className="btn btn-primary w-32">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
