import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FormErrorProps {
  error?: string;
}

export default function FormError({ error }: FormErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key={error}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-md flex items-center gap-2 text-danger-700"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
