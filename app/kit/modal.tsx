import { useSearchParams } from "@remix-run/react";
import {
  useEffect,
  useRef,
} from "react";
import { MdClose } from "react-icons/md";
import ReactModal from "react-modal";

interface Props {
	children: React.ReactNode;
	name: string;
	title: string;
	focus?: string;
}

export function Modal({ children, name, title, focus }: Props) {
	const [params, setParams] = useSearchParams();
	const ref = useRef<HTMLDivElement>(null);
	if (focus) {
		useEffect(() => {
			if (params.get("modal") === name) {
				setTimeout(() => {
					const el = ref.current?.querySelector(
						`[name=${focus}]`,
					) as HTMLInputElement;
					el?.focus();
				});
			}
		}, [params]);
	}
	const onClose = () => {
		params.delete("modal");
		setParams(params);
	};
	return (
		<ReactModal
			isOpen={params.get("modal") === name}
			ariaHideApp={false}
			className="absolute top-1/4 left-1/2 bg-transparent"
			style={{ content: { transform: "translate(-50%, -50%)" } }}
			overlayClassName="fixed inset-0 bg-black bg-opacity-50"
			onRequestClose={onClose}
		>
			<div className="flex flex-col items-center justify-center h-full">
				<div className="flex-1" />
				<div className="bg-zinc-700 rounded relative border border-zinc-500">
					<div
						className="absolute text-zinc-300 p-2 cursor-pointer"
						onClick={onClose}
					>
						<MdClose />
					</div>
					<div className="text-center text-zinc-300 py-1 border-b border-zinc-500">
						{title}
					</div>
					<div className="px-8 pt-6 pb-8" ref={ref}>
						{children}
					</div>
				</div>
				<div className="flex-[2]" />
			</div>
		</ReactModal>
	);
}
