import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = 'Log a win' }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed bottom-28 right-6 z-40',
        'flex items-center gap-2 px-6 py-4 rounded-2xl',
        'bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white shadow-2xl',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9]'
      )}
      aria-label="Record result"
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Log Win</span>
    </motion.button>
  );
}