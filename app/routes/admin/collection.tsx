import type { LoaderFunction } from "@remix-run/node";

// import { json } from "@remix-run/node";
// import { useFetcher, useLoaderData } from "@remix-run/react";
// import { useEffect, useRef } from "react";
// import { useState } from "react";
// import FullTabs from "~/components/admin/FullTabs";
// import RoundedTabs from "~/components/admin/RoundedTabs";
// import Query from "~/components/admin/database/Query";
// import Table from "~/components/admin/database/Table";
// import { db } from "~/lib/database";
// import { getStorage, setStorage } from "~/lib/storage";

// type LoaderData = {
//     // tables: string[];
// };

// export const loader: LoaderFunction = async () => {
//     return json({});
// };

// class ContentTab {
//     label: string;
//     value: string;
//     content?: any;

//     constructor(value?: string) {
//         this.label = value!;
//         this.value = value!;
//         this.content = [];
//     }
// }

// export default function QueryRoute() {
//     // const { } = useLoaderData<LoaderData>();

//     // const onQueryClick = () => {
//     //     setContentTabs([...contentTabs, new ContentTab("query")]);
//     //     setActiveContentTab(contentTabs.length);
//     // };

//     const leftTabs = [
//         {
//             label: "Collections",
//             value: "collections",
//         },
//     ];

//     const [activeLeftTab, setActiveLeftTab] = useState(leftTabs[0]);

//     const [contentTabs, setContentTabs] = useState<ContentTab[]>([]);
//     const [activeContentTab, setActiveContentTab] = useState(0);

//     useEffect(() => {
//         const tmpTabs = getStorage("collection-content-tabs", []);
//         setContentTabs(tmpTabs);
//     }, []);

//     useEffect(() => {
//         setStorage("collection-content-tabs", contentTabs);
//     }, [contentTabs]);

//     const onCloseContentTab = (index: number) => {
//         const tabs = [...contentTabs];
//         tabs.splice(index, 1);
//         setContentTabs(tabs);
//         if (activeContentTab === tabs.length) {
//             setActiveContentTab(activeContentTab - 1);
//         }
//     };

//     const onContentChange = (content: any) => {
//         const tabs = [...contentTabs];
//         tabs[activeContentTab].content = content;
//         setContentTabs(tabs);
//     };

//     return (
//         <div className="flex flex-row py-2 select-none h-full">
//             <div className="flex flex-col mt-2 mr-2">
//                 <div className="h-6 flex flex-row items-center">
//                     <RoundedTabs
//                         items={leftTabs}
//                         active={activeLeftTab}
//                         onItemClick={(item) => setActiveLeftTab(item)}
//                     />
//                 </div>
//                 <div className="flex flex-col text-sm ml-2 mt-4 space-y-1 bg-zic-800 flex-1 border-zinc-500">
//                     {tables.map((table) => (
//                         <div
//                             key={table}
//                             className="px-2 py-1 text-orange-200 cursor-pointer"
//                         >
//                             <a onClick={() => onTableMenuClick(table)}>
//                                 {!table.startsWith("_") && (
//                                     <span className="invisible">_</span>
//                                 )}
//                                 {table}
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="bg-zinc-600 w-px h-full"></div>
//             <div className="flex-1 mx-2 mt-2 flex flex-col">
//                 <div className="flex flex-row items-center">
//                     <div
//                         className="text-xs mr-2 ml-1 border py-px px-1 rounded border-zinc-400 text-zinc-400 bg-zinc-600 cursor-pointer"
//                         onClick={onQueryClick}
//                     >
//                         SQL
//                     </div>
//                     <FullTabs
//                         className="flex-1"
//                         items={contentTabs}
//                         active={activeContentTab}
//                         onItemClick={setActiveContentTab}
//                         onItemClose={onCloseContentTab}
//                     />
//                 </div>
//                 <div className="flex-1">
//                     {contentTabs.length > 0 &&
//                         contentTabs[activeContentTab].type === "query" && (
//                         <Query
//                             content={contentTabs[activeContentTab].content!}
//                             onChange={onContentChange}
//                         />
//                     )}
//                     {contentTabs.length > 0 &&
//                         contentTabs[activeContentTab].type === "table" && (
//                         <Table
//                             name={contentTabs[activeContentTab].value}
//                             content={contentTabs[activeContentTab].content!}
//                             onChange={onContentChange}
//                         />
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
