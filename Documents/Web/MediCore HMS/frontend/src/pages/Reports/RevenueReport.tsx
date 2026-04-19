import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import { reportsService } from '@/services/reports';
import { formatCurrency } from '@/utils/format';
import { pageEnter, cardMount, staggerContainer } from '@/utils/motion';
import { Card, CardBody, CardHeader, Button, Input, CardSkeleton } from '@/components';
import { cn } from '@/lib/utils';

export default function RevenueReport() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['revenueReport', startDate, endDate],
    queryFn: () => reportsService.getRevenueReport({ startDate, endDate }),
  });

  const { data: revenueByDateData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueByDate', startDate, endDate],
    queryFn: () => reportsService.getRevenueByDate({ startDate, endDate }),
  });

  const summary = summaryData?.data;
  const revenueByDate = revenueByDateData?.data || [];
  const isLoading = summaryLoading || revenueLoading;

  const handleExport = async () => {
    try {
      const blob = await reportsService.exportRevenueReport({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue-report-${startDate}-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-800">Revenue Report</h1>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-800">Revenue Report</h1>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Total Revenue</p>
              <p className={cn('text-3xl font-bold text-success-600')}>{formatCurrency(summary?.totalRevenue || 0)}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Total Bills</p>
              <p className={cn('text-3xl font-bold text-primary-600')}>{summary?.totalBills || 0}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Paid Bills</p>
              <p className={cn('text-3xl font-bold text-success-600')}>{summary?.paidBills || 0}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-secondary-500">Pending Bills</p>
              <p className={cn('text-3xl font-bold text-warning-600')}>{summary?.pendingBills || 0}</p>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      <Card>
        <CardHeader title="Revenue by Day" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDate}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
