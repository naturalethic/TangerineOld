interface Item {
    label: string;
    value: string;
}

interface TabsProps {
    items: Item[];
    active: Item;
    onItemClick: (item: Item) => void;
}

export default function RoundedTabs({ items, active, onItemClick }: TabsProps) {
    return (
        <div className="flex flex-row text-xs pl-2">
            {items.map((item) => (
                <Tab
                    key={item.value}
                    label={item.label}
                    active={item.value === active.value}
                    onClick={() => onItemClick(item)}
                />
            ))}
        </div>
    );
}

interface TabProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function Tab({ label, active, onClick }: TabProps) {
    const activeClass = active && "bg-zinc-500 text-zinc-100 rounded";
    return (
        <div className={`px-1 cursor-pointer ${activeClass}`} onClick={onClick}>
            {label}
        </div>
    );
}
