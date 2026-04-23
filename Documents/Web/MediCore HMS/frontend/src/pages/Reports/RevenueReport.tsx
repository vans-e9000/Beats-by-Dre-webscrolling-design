import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Download, Printer, Calendar, DollarSign, FileText, CreditCard, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { reportsService } from '@/services/reports';
import { billsService } from '@/services/bills';
import { formatCurrency, formatDate } from '@/utils/format';
import { pageEnter, cardMount, staggerContainer, fadeIn } from '@/utils/motion';
import { Card, CardBody, CardHeader, Button, Input, CardSkeleton } from '@/components';
import { useToast } from '@/components';
import { cn } from '@/lib/utils';

// Teal theme colors for Clean Clinical design
const THEME_COLORS = {
  primary: '#0891b2',
  primaryLight: '#67e8f9',
  primaryDark: '#0e7490',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#64748b',
  chart: ['#0891b2', '#67e8f9', '#0e7490', '#22d3ee', '#06b6d4', '#2dd4bf'],
};

interface RevenueByService {
  serviceName: string;
  revenue: number;
  count: number;
}

interface RevenueByPaymentStatus {
  status: string;
  amount: number;
  count: number;
  color?: string;
}

export default function RevenueReport() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const { toast } = useToast();

  // Fetch revenue report data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['revenueReport', startDate, endDate],
    queryFn: () => reportsService.getRevenueReport({ startDate, endDate }),
  });

  // Fetch revenue by date for trend chart
  const { data: revenueByDateData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueByDate', startDate, endDate],
    queryFn: () => reportsService.getRevenueByDate({ startDate, endDate }),
  });

  // Fetch bills for detailed analysis
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', startDate, endDate],
    queryFn: () =>
      billsService.getAll({
        startDate,
        endDate,
        limit: 1000,
      }),
  });

  const isLoading = summaryLoading || revenueLoading || billsLoading;

  const summary = summaryData?.data;
  const revenueByDate = revenueByDateData?.data || [];

  // Calculate revenue by service type from bills
  const revenueByService: RevenueByService[] = (() => {
    if (!billsData?.data) return [];

    const serviceMap = new Map<string, { revenue: number; count: number }>();

    billsData.data.forEach((bill) => {
      bill.items?.forEach((item) => {
        const serviceName = item.serviceName || 'Unknown Service';
        const current = serviceMap.get(serviceName) || { revenue: 0, count: 0 };
        current.revenue += item.subtotal || 0;
        current.count += item.quantity || 0;
        serviceMap.set(serviceName, current);
      });
    });

    return Array.from(serviceMap.entries())
      .map(([serviceName, data]) => ({
        serviceName,
        revenue: data.revenue,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 services
  })();

  // Calculate revenue by payment status
  const revenueByPaymentStatus: RevenueByPaymentStatus[] = (() => {
    if (!billsData?.data) return [];

    const statusMap = new Map<string, { amount: number; count: number }>();

    billsData.data.forEach((bill) => {
      const status = bill.status || 'unknown';
      const current = statusMap.get(status) || { amount: 0, count: 0 };
      current.amount += bill.totalAmount || 0;
      current.count += 1;
      statusMap.set(status, current);
    });

    const statusLabels: Record<string, string> = {
      paid: 'Paid',
      pending: 'Pending',
      partial: 'Partial',
      overdue: 'Overdue',
      draft: 'Draft',
    };

    const statusColors: Record<string, string> = {
      paid: THEME_COLORS.success,
      pending: THEME_COLORS.warning,
      partial: THEME_COLORS.primary,
      overdue: THEME_COLORS.danger,
      draft: THEME_COLORS.secondary,
    };

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      status: statusLabels[status] || status,
      originalStatus: status,
      amount: data.amount,
      count: data.count,
      color: statusColors[status] || THEME_COLORS.secondary,
    }));
  })();

// Table columns for revenue by service (defined inline for type compatibility)

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Revenue Report', '', ''],
        [`Date Range: ${formatDate(startDate)} - ${formatDate(endDate)}`, '', ''],
        ['', '', ''],
        ['Summary', '', ''],
        ['Total Revenue', formatCurrency(summary?.totalRevenue || 0), ''],
        ['Total Bills', (summary?.totalBills || 0).toString(), ''],
        ['Paid Bills', (summary?.paidBills || 0).toString(), ''],
        ['Pending Bills', (summary?.pendingBills || 0).toString(), ''],
        ['', '', ''],
        ['Revenue by Service', '', ''],
        ['Service', 'Quantity', 'Revenue'],
        ...revenueByService.map((s) => [s.serviceName, s.count.toString(), formatCurrency(s.revenue)]),
        ['', '', ''],
        ['Revenue by Payment Status', '', ''],
        ['Status', 'Count', 'Amount'],
        ...revenueByPaymentStatus.map((s) => [s.status, s.count.toString(), formatCurrency(s.amount)]),
        ['', '', ''],
        ['Daily Revenue', '', ''],
        ['Date', 'Revenue', ''],
        ...revenueByDate.map((d) => [d.date, formatCurrency(d.revenue), '']),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue-report-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast('Export Successful', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      toast('Export Failed', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary-800">Revenue Report</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-secondary-800">Revenue Report</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="primary" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success-100">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Total Revenue</p>
                <p className={cn('text-2xl font-bold text-success-600')}>
                  {formatCurrency(summary?.totalRevenue || 0)}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-100">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Total Bills</p>
                <p className={cn('text-2xl font-bold text-primary-600')}>{summary?.totalBills || 0}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success-100">
                <CreditCard className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Paid Bills</p>
                <p className={cn('text-2xl font-bold text-success-600')}>{summary?.paidBills || 0}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning-100">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Pending Bills</p>
                <p className={cn('text-2xl font-bold text-warning-600')}>{summary?.pendingBills || 0}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue Trend Chart */}
      <motion.div variants={cardMount} initial="initial" animate="animate">
        <Card>
          <CardHeader title="Revenue Trend" />
          <CardBody>
            {revenueByDate.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={THEME_COLORS.primary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-secondary-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                  <p>No revenue data available for the selected period</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Revenue Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service Type */}
        <motion.div variants={cardMount} initial="initial" animate="animate">
          <Card className="h-full">
            <CardHeader title="Revenue by Service Type" />
            <CardBody>
              {revenueByService.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueByService.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => formatCurrency(value)}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="serviceName"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          width={100}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
<Bar dataKey="revenue" fill={THEME_COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto rounded-lg border border-secondary-200">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {revenueByService.map((item) => (
                <tr key={item.serviceName}>
                  <td className="px-6 py-4 text-sm text-secondary-900">{item.serviceName}</td>
                  <td className="px-6 py-4 text-sm text-secondary-500 text-right">{item.count}</td>
                  <td className="px-6 py-4 text-sm text-secondary-900 text-right">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-secondary-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                    <p>No service revenue data available</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Revenue by Payment Status */}
        <motion.div variants={cardMount} initial="initial" animate="animate">
          <Card className="h-full">
            <CardHeader title="Revenue by Payment Status" />
            <CardBody>
              {revenueByPaymentStatus.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueByPaymentStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                        >
                          {revenueByPaymentStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Amount']}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {revenueByPaymentStatus.map((status) => (
                      <div
                        key={status.status}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${status.color}15` }}
                      >
                        <p className="text-sm" style={{ color: status.color }}>
                          {status.status}
                        </p>
                        <p className="text-lg font-bold" style={{ color: status.color }}>
                          {formatCurrency(status.amount)}
                        </p>
                        <p className="text-xs text-secondary-500">{status.count} bills</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-secondary-500">
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                    <p>No payment status data available</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Summary Footer */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <p className="text-sm text-secondary-500 text-center">
          Revenue report from {formatDate(startDate)} to {formatDate(endDate)}
        </p>
      </motion.div>
    </motion.div>
  );
}
