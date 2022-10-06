import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import FullTabs from "~/components/admin/FullTabs";
import RoundedTabs from "~/components/admin/RoundedTabs";
import Query from "~/components/admin/database/Query";
import { db } from "~/lib/database";
import { getStorage, setStorage } from "~/lib/storage";

type LoaderData = {
    tables: string[];
};

export const loader: LoaderFunction = async () => {
    const tables = await db.tables();
    return json({ tables });
};

class ContentTab {
    type: "table" | "query";
    label: string;
    value: string;
    content?: any;

    static counter = 1;

    constructor(type: ContentTab["type"], value?: string) {
        if (type === "table" && !value) {
            throw new Error("value is required for table");
        }
        this.type = type;
        if (type === "table") {
            this.label = value!;
            this.value = value!;
        } else {
            let count = ContentTab.counter++;
            this.label = `Query ${count}`;
            this.value = `query-${count}`;
            this.content = {
                query: "",
                result: null,
                error: null,
            };
        }
    }
}

export default function QueryRoute() {
    const { tables } = useLoaderData<LoaderData>();

    // const onQuerySelect: ChangeEventHandler<HTMLSelectElement> = (event) => {
    //     setQuery(event.target.selectedOptions[0].innerText);
    //     event.target.value = "";
    //     editor.current!.focus();
    //     setTimeout(() => {
    //         editor.current!.select();
    //     }, 1);
    // };

    const file = useRef<HTMLInputElement>(null);

    const onImport = async () => {
        file.current!.click();
    };

    const onTableMenuClick = (name: string) => {
        for (const tab of contentTabs) {
            if (tab.value === name) {
                setActiveContentTab(contentTabs.indexOf(tab));
                return;
            }
        }
        setContentTabs([...contentTabs, new ContentTab("table", name)]);
        setActiveContentTab(contentTabs.length);
    };

    const onQueryClick = () => {
        setContentTabs([...contentTabs, new ContentTab("query")]);
        setActiveContentTab(contentTabs.length);
    };

    const leftTabs = [
        {
            label: "Tables",
            value: "tables",
        },
        {
            label: "Queries",
            value: "queries",
        },
        {
            label: "History",
            value: "history",
        },
    ];

    const [activeLeftTab, setActiveLeftTab] = useState(leftTabs[0]);

    const [contentTabs, setContentTabs] = useState<ContentTab[]>([]);
    const [activeContentTab, setActiveContentTab] = useState(0);

    useEffect(() => {
        const tmpTabs = getStorage("database-content-tabs", []);
        let counter = 1;
        for (const tab of tmpTabs) {
            if (tab.type === "query") {
                counter = Math.max(
                    counter,
                    Number(tab.value.split("-")[1]) + 1,
                );
            }
        }
        ContentTab.counter = counter;
        setContentTabs(tmpTabs);
    }, []);

    useEffect(() => {
        setStorage("database-content-tabs", contentTabs);
    }, [contentTabs]);

    const onCloseContentTab = (index: number) => {
        const tabs = [...contentTabs];
        tabs.splice(index, 1);
        setContentTabs(tabs);
        if (activeContentTab === tabs.length) {
            setActiveContentTab(activeContentTab - 1);
        }
    };

    const onQueryChange = (content: any) => {
        const tabs = [...contentTabs];
        tabs[activeContentTab].content = content;
        setContentTabs(tabs);
    };

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mt-2 mr-2">
                <div className="h-6 flex flex-row items-center">
                    <RoundedTabs
                        items={leftTabs}
                        active={activeLeftTab}
                        onItemClick={(item) => setActiveLeftTab(item)}
                    />
                </div>
                <div className="flex flex-col text-sm ml-2 mt-4 space-y-1 bg-zic-800 flex-1 border-zinc-500">
                    {tables.map((table) => (
                        <div
                            key={table}
                            className="px-2 py-1 text-orange-200 cursor-pointer"
                        >
                            <a onClick={() => onTableMenuClick(table)}>
                                {!table.startsWith("_") && (
                                    <span className="invisible">_</span>
                                )}
                                {table}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-zinc-600 w-px h-full"></div>
            <div className="flex-1 mx-2 mt-2 flex flex-col">
                <div className="flex flex-row items-center">
                    <div
                        className="text-xs mr-2 ml-1 border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer"
                        onClick={onQueryClick}
                    >
                        SQL
                    </div>
                    <FullTabs
                        className="flex-1"
                        items={contentTabs}
                        active={activeContentTab}
                        onItemClick={setActiveContentTab}
                        onItemClose={onCloseContentTab}
                    />
                </div>
                <div className="flex-1">
                    {contentTabs.length > 0 &&
                        contentTabs[activeContentTab].type === "query" && (
                        <Query
                            content={contentTabs[activeContentTab].content!}
                            onChange={onQueryChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
