import { motion } from "framer-motion";

interface FlashProps {
    level: "info" | "success" | "warning" | "error";
    message: string;
}

export function Flash({ level, message }: FlashProps) {
    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center h-20 bg-green-700"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
        >
            <div>{message}</div>
        </motion.div>
    );
}
