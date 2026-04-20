import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export default function FormField({
  label,
  error,
  children,
  required,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">{children}</div>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
