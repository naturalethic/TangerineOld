import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Query from "~/components/admin/database/Query";
import Table from "~/components/admin/database/Table";
import { FullTabs, Item, RoundedTabs } from "~/kit";
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
            this.content = [];
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

export default function DatabaseRoute() {
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
        for (const tab of Object.values(contentTabs)) {
            if (tab.value === name) {
                setContentTab(tab.value);
                return;
            }
        }
        const tab = new ContentTab("table", name);
        setContentTabs({ ...contentTabs, ...{ [tab.value]: tab } });
        setContentTab(tab.value);
    };

    const onQueryClick = () => {
        const tab = new ContentTab("query");
        setContentTabs({ ...contentTabs, ...{ [tab.value]: tab } });
        setContentTab(tab.value);
    };

    const [leftTab, setLeftTab] = useState("tables");

    const [contentTabs, setContentTabs] = useState<Record<string, ContentTab>>(
        {},
    );
    const [contentTab, setContentTab] = useState("");

    useEffect(() => {
        const tabs: Record<string, ContentTab> = getStorage(
            "database-content-tabs",
            [],
        );
        let counter = 1;
        Object.values(tabs).forEach((tab) => {
            if (tab.type === "query") {
                counter = Math.max(
                    counter,
                    Number(tab.value.split("-")[1]) + 1,
                );
            }
        });
        ContentTab.counter = counter;
        setContentTabs(tabs);
        setContentTab(getStorage("database-content-tab", ""));
    }, []);

    useEffect(() => {
        setStorage("database-content-tabs", contentTabs);
        setStorage("database-content-tab", contentTab);
    }, [contentTabs]);

    const onCloseContentTab = (value: string) => {
        const tabs = { ...contentTabs };
        const index = Object.keys(tabs).indexOf(value);
        delete tabs[value];
        setContentTabs(tabs);
        if (contentTab === value) {
            setContentTab(Object.keys(tabs)[Math.max(0, index - 1)]);
        }
    };

    const onContentChange = (content: any) => {
        const tabs = { ...contentTabs };
        tabs[contentTab].content = content;
        setContentTabs(tabs);
    };

    return (
        <div className="flex flex-row py-2 select-none h-full">
            <div className="flex flex-col mt-2 mr-2">
                <div className="h-6 flex flex-row items-center">
                    <RoundedTabs value={leftTab} onChange={setLeftTab}>
                        <Item label="Tables" value="tables" />
                        <Item label="Queries" value="queries" />
                        <Item label="History" value="history" />
                    </RoundedTabs>
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
            <div className="bg-zinc-600 w-px h-full" />
            <div className="flex-1 mx-2 mt-2 flex flex-col">
                <div className="flex flex-row items-center">
                    <div
                        className="text-xs mr-2 ml-1 border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer"
                        onClick={onQueryClick}
                    >
                        SQL
                    </div>
                    <FullTabs
                        value={contentTab}
                        onChange={setContentTab}
                        onClose={onCloseContentTab}
                    >
                        {Object.values(contentTabs).map((tab) => (
                            <Item
                                key={tab.value}
                                label={tab.label}
                                value={tab.value}
                            />
                        ))}
                    </FullTabs>
                </div>
                <div className="flex-1">
                    {contentTabs[contentTab] &&
                        contentTabs[contentTab].type === "query" && (
                            <Query
                                content={contentTabs[contentTab].content}
                                onChange={onContentChange}
                            />
                        )}
                    {contentTabs[contentTab] &&
                        contentTabs[contentTab].type === "table" && (
                            <Table
                                name={contentTabs[contentTab].value}
                                content={contentTabs[contentTab].content}
                                onChange={onContentChange}
                            />
                        )}
                </div>
            </div>
        </div>
    );
}
