import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { reportsService } from '@/services/reports';
import { formatDate, formatCurrency } from '@/utils/format';
import { pageEnter, cardMount, staggerContainer } from '@/utils/motion';
import { Card, CardBody, CardHeader, CardSkeleton } from '@/components';
import { cn } from '@/lib/utils';

export default function DailySummary() {
  const today = new Date().toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['dailySummary', today],
    queryFn: () => reportsService.getDailySummary(today),
  });

  const summary = data?.data;

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-800">Daily Summary</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-800">Daily Summary</h1>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Total Patients</p>
              <p className={cn('text-3xl font-bold text-primary-600')}>{summary?.totalPatients || 0}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">New Patients</p>
              <p className={cn('text-3xl font-bold text-success-600')}>{summary?.newPatients || 0}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Total Bills</p>
              <p className={cn('text-3xl font-bold text-secondary-600')}>{summary?.totalBills || 0}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Revenue</p>
              <p className={cn('text-3xl font-bold text-success-600')}>{formatCurrency(summary?.totalRevenue || 0)}</p>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      <Card>
        <CardHeader title={cn(`Summary for ${formatDate(today)}`)} />
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-500">Pending Payments</p>
              <p className="text-lg font-semibold">{summary?.pendingPayments || 0}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
