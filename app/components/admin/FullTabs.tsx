import { MdClose } from "react-icons/md";

interface Item {
    label: string;
    value: string;
}

interface TabsProps {
    className?: string;
    items: Item[];
    active: number;
    onItemClick: (i: number) => void;
    onItemClose: (i: number) => void;
}

export default function FullTabs({
    className = "",
    items,
    active,
    onItemClick,
    onItemClose,
}: TabsProps) {
    return (
        <div
            className={`flex flex-row text-xs pr-px h-6 bg-zinc-800 rounded ${className}`}
        >
            {items.map((item, i) => (
                <Tab
                    key={item.value}
                    label={item.label}
                    active={i === active}
                    onClick={() => onItemClick(i)}
                    onClose={() => onItemClose(i)}
                />
            ))}
        </div>
    );
}

interface TabProps {
    label: string;
    active: boolean;
    onClick: () => void;
    onClose: () => void;
}

function Tab({ label, active, onClick, onClose }: TabProps) {
    const activeClass = active && "bg-zinc-500 text-zinc-100";

    const onInternalClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div
            className={`group relative flex-1 flex flex-row m-px mr-0 cursor-pointer items-center text-center rounded ${activeClass}`}
            onClick={onClick}
        >
            <div className="flex-1">{label}</div>
            <MdClose
                className="absolute invisible group-hover:visible p-px ml-1 h-5 w-5"
                onClick={onInternalClose}
            />
        </div>
    );
}
