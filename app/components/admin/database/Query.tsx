import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { JSONTree } from "react-json-tree";
import type { ActionData } from "~/routes/admin/database/query";

interface Content {
    query: string;
    result: any;
    error: any;
}

interface Props {
    content: Content;
    onChange: (content: Content) => void;
}

const theme = {
    base00: "#18181A",
    base01: "#252525",
    base02: "#464646",
    base03: "#525252",
    base04: "#ababab",
    base05: "#b9b9b9",
    base06: "#e3e3e3",
    base07: "#f7f7f7",
    base08: "#7c7c7c",
    base09: "#999999",
    base0A: "#a0a0a0",
    base0B: "#8e8e8e",
    base0C: "#868686",
    base0D: "#686868",
    base0E: "#747474",
    base0F: "#5e5e5e",
};

export default function Query({ content, onChange }: Props) {
    const action = useFetcher<ActionData>();
    const editor = useRef<HTMLTextAreaElement>(null);

    const submitQuery = () => {
        action.submit(
            { query: content.query },
            { method: "post", action: "/admin/database/query" },
        );
    };

    const updateContent = () => {
        const newContent = { ...content, query: editor.current!.value };
        if (action.data) {
            newContent.result = action.data?.result ?? null;
            newContent.error = action.data?.error ?? null;
        }
        onChange(newContent);
    };

    useEffect(updateContent, [action.data]);

    return (
        <div className="flex flex-col mt-2 h-full">
            <div className="flex flex-col h-1/2 relative">
                <textarea
                    className="bg-zinc-800 rounded py-1 px-2 h-full resize-none"
                    defaultValue={content.query}
                    onChange={updateContent}
                    ref={editor}
                ></textarea>
                <div className="flex flex-row justify-end text-sm mt-2 absolute right-2 bottom-2">
                    <div
                        className="rounded bg-orange-200 text-zinc-700 px-2 py-px font-bold"
                        onClick={submitQuery}
                    >
                        Execute
                    </div>
                </div>
            </div>
            {(content.result || content.error) && (
                <div className="rounded py-1 px-2 bg-zinc-900 mt-3">
                    {content.result && (
                        <JSONTree
                            data={content.result}
                            shouldExpandNode={() => true}
                            theme={theme}
                            invertTheme={false}
                        />
                    )}
                    {content.error && (
                        <JSONTree
                            data={content.error}
                            shouldExpandNode={() => true}
                            theme={theme}
                            invertTheme={false}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
