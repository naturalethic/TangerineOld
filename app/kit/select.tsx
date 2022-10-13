import { AnimatePresence, motion } from "framer-motion";
import { MouseEventHandler, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";

interface SelectProps {
	children: React.ReactElement[];
	value?: string;
	border?: boolean;
	onChange: (value: string) => void;
	className?: string;
}

export function Select({
	children,
	value,
	border = true,
	onChange,
	className,
}: SelectProps) {
	const [open, setOpen] = useState(false);

	const onMenuClick: MouseEventHandler = (event) => {
		const el = event.target as HTMLElement;
		if (el.dataset.value) {
			setOpen(false);
			onChange(el.dataset.value);
		}
	};

	const items = children
		.filter((child) => child.props.value !== value)
		.map((it) => (
			<div
				key={it.props.value}
				className="hover:text-zinc-700 hover:bg-zinc-300 pl-2 pr-2 rounded select-none cursor-pointer"
				data-value={it.props.value}
			>
				{it.props.label}
			</div>
		));
	return (
		<div className={className}>
			{open && (
				<div
					className="absolute bg-black inset-0 z-40"
					style={{ opacity: 0.000001 }}
					onClick={() => setOpen(false)}
				/>
			)}
			<div className="text-sm relative">
				<div
					className={`flex flex-row cursor-pointer select-none pl-4 pr-2 py-1 rounded border-zinc-500 ${
						border && "border"
					}`}
					onClick={() => setOpen(!open)}
				>
					<div>
						{children.map((it) =>
							it.props.value === value ? (
								<div key={it.props.value}>{it.props.label}</div>
							) : (
								<div key={it.props.value} className="h-0 invisible">
									{it.props.label}
								</div>
							),
						)}
					</div>
					<div className="flex-1" />
					<AiFillCaretDown className="mt-1" />
				</div>
				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.1 }}
							className="absolute border z-50 pl-2 pr-2 mt-1 border-zinc-500 bg-zinc-700 rounded flex flex-col space-y-2 py-2"
							onClick={onMenuClick}
							style={{
								width: "100%",
							}}
						>
							{items}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
