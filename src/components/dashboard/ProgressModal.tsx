import { ProgressChart } from "@/components/ProgressChart";
import { motion } from "framer-motion";

export function ProgressModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl my-4 mx-2 sm:mx-4"
      >
        <ProgressChart onClose={onClose} />
      </motion.div>
    </motion.div>
  );
}
