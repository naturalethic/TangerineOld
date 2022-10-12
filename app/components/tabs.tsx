import { AnimatePresence, motion } from "framer-motion";
import { MouseEventHandler } from "react";
import { MdClose } from "react-icons/md";

interface TabProps {
    label: string;
    value: string;
}

export function Tab(_: TabProps) {
    return <div />;
}

interface TabsProps {
    children: React.ReactElement[] | React.ReactElement;
    value: string;
    onChange?: (value: string) => void;
    onClose?: (value: string) => void;
}

export function RoundedTabs({
    children,
    value,
    onChange = () => {},
}: TabsProps) {
    const onClick: MouseEventHandler = (event) => {
        const el = event.target as HTMLElement;
        if (el.dataset.value) {
            onChange(el.dataset.value);
        }
    };

    const tabs = (Array.isArray(children) ? children : [children]).map(
        (tab) => (
            <div
                key={tab.props.value}
                className={`px-1 cursor-pointer ${
                    tab.props.value === value &&
                    "bg-zinc-500 text-zinc-100 rounded"
                }`}
                data-value={tab.props.value}
            >
                {tab.props.label}
            </div>
        ),
    );

    return (
        <div className="flex flex-row text-xs pl-2" onClick={onClick}>
            {tabs}
        </div>
    );
}

export function FullTabs({
    children,
    value,
    onChange = () => {},
    onClose = () => {},
}: TabsProps) {
    const onClick: MouseEventHandler = (event) => {
        const el = (event.target as HTMLElement).closest(
            ".group",
        ) as HTMLElement;
        if (el && el.dataset.value) {
            onChange(el.dataset.value);
        }
    };
    const onClickClose: MouseEventHandler = (event) => {
        event.stopPropagation();
        const el = (event.target as HTMLElement).closest(
            ".group",
        ) as HTMLElement;
        if (el && el.dataset.value) {
            onClose(el.dataset.value);
        }
    };

    const tabs = (Array.isArray(children) ? children : [children]).map(
        (tab) => (
            <motion.div
                animate={{
                    backgroundColor:
                        tab.props.value === value ? "#71717A" : "#27272A",
                    color: tab.props.value === value ? "#F4F4F5" : "D4D4D8",
                }}
                transition={{ duration: 0.1 }}
                key={tab.props.value}
                className="group relative flex-1 flex flex-row m-px mr-0 cursor-pointer items-center text-center rounded"
                onClick={onClick}
                data-value={tab.props.value}
            >
                <div className="flex-1">{tab.props.label}</div>
                <MdClose
                    className="absolute invisible group-hover:visible p-px ml-1 h-5 w-5"
                    onClick={onClickClose}
                />
            </motion.div>
        ),
    );

    return (
        <div className="flex flex-row text-xs pr-px h-6 bg-zinc-800 rounded flex-1 full-tabs">
            {tabs}
        </div>
    );
}
