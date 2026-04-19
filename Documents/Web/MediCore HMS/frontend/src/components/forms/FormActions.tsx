import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export default function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 mt-6', className)}>
      {children}
    </div>
  );
}
