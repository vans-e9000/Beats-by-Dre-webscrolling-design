import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardBody } from '@/components';
import { fadeIn } from '@/utils/motion';

export default function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-secondary-50 flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'radial-gradient(circle, var(--color-secondary-100) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">MediCore HMS</h1>
          <p className="mt-2 text-secondary-600">Hospital Management System</p>
        </div>
        <Card>
          <CardBody>{children || <Outlet />}</CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
