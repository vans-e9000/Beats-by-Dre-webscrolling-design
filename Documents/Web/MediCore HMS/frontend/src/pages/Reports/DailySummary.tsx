import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { format, subDays } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Download, Printer, Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { reportsService } from '@/services/reports';
import { visitsService } from '@/services/visits';
import { billsService } from '@/services/bills';
import { formatCurrency, formatDate } from '@/utils/format';
import { pageEnter, cardMount, staggerContainer, fadeIn } from '@/utils/motion';
import { Card, CardBody, CardHeader, Button, Input, CardSkeleton, Badge } from '@/components';
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
  chart: ['#0891b2', '#67e8f9', '#0e7490', '#22d3ee', '#06b6d4'],
};

interface DailyStats {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  cancelledVisits: number;
  totalRevenue: number;
  pendingBills: number;
  paidBills: number;
  overdueBills: number;
}

interface VisitData {
  date: string;
  visits: number;
  completed: number;
}

export default function DailySummary() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(subDays(today, 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const { toast } = useToast();

  // Fetch visits data for the date range
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['visits', startDate, endDate],
    queryFn: () =>
      visitsService.getAll({
        startDate,
        endDate,
        limit: 1000,
      }),
  });

  // Fetch bills data for the date range
  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ['bills', startDate, endDate],
    queryFn: () =>
      billsService.getAll({
        startDate,
        endDate,
        limit: 1000,
      }),
  });

  // Fetch daily summary from API
  const { data: _summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dailySummary', startDate, endDate],
    queryFn: () => reportsService.getDailySummary(endDate),
  });

  const isLoading = visitsLoading || billsLoading || summaryLoading;

  // Calculate statistics from real data
  const stats: DailyStats = (() => {
    if (!visitsData?.data || !billsData?.data) {
      return {
        totalVisits: 0,
        completedVisits: 0,
        pendingVisits: 0,
        cancelledVisits: 0,
        totalRevenue: 0,
        pendingBills: 0,
        paidBills: 0,
        overdueBills: 0,
      };
    }

    const visits = visitsData.data;
    const bills = billsData.data;

    return {
      totalVisits: visits.length,
      completedVisits: visits.filter((v) => v.status === 'completed').length,
      pendingVisits: visits.filter((v) => v.status === 'scheduled' || v.status === 'in_progress').length,
      cancelledVisits: visits.filter((v) => v.status === 'cancelled').length,
      totalRevenue: bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0),
      pendingBills: bills.filter((b) => b.status === 'pending' || b.status === 'partial').length,
      paidBills: bills.filter((b) => b.status === 'paid').length,
      overdueBills: bills.filter((b) => b.status === 'overdue').length,
    };
  })();

  // Prepare chart data
  const visitStatusData = [
    { name: 'Completed', value: stats.completedVisits, color: THEME_COLORS.success },
    { name: 'Pending', value: stats.pendingVisits, color: THEME_COLORS.warning },
    { name: 'Cancelled', value: stats.cancelledVisits, color: THEME_COLORS.danger },
  ].filter((item) => item.value > 0);

  // Bill status data for charts (unused but kept for future use)
  void [
    { name: 'Paid', value: stats.paidBills, color: THEME_COLORS.success },
    { name: 'Pending', value: stats.pendingBills, color: THEME_COLORS.warning },
    { name: 'Overdue', value: stats.overdueBills, color: THEME_COLORS.danger },
  ].filter((item) => item.value > 0);

  // Generate daily visits trend data
  const visitsTrendData: VisitData[] = (() => {
    if (!visitsData?.data) return [];

    const visits = visitsData.data;
    const dateMap = new Map<string, { visits: number; completed: number }>();

    visits.forEach((visit) => {
      const date = format(new Date(visit.visitDate), 'MMM dd');
      const current = dateMap.get(date) || { visits: 0, completed: 0 };
      current.visits += 1;
      if (visit.status === 'completed') {
        current.completed += 1;
      }
      dateMap.set(date, current);
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        completed: data.completed,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Daily Summary Report', '', ''],
        [`Date Range: ${formatDate(startDate)} - ${formatDate(endDate)}`, '', ''],
        ['', '', ''],
        ['Metric', 'Count', ''],
        ['Total Visits', stats.totalVisits.toString(), ''],
        ['Completed Visits', stats.completedVisits.toString(), ''],
        ['Pending Visits', stats.pendingVisits.toString(), ''],
        ['Cancelled Visits', stats.cancelledVisits.toString(), ''],
        ['', '', ''],
        ['Total Revenue', formatCurrency(stats.totalRevenue), ''],
        ['Paid Bills', stats.paidBills.toString(), ''],
        ['Pending Bills', stats.pendingBills.toString(), ''],
        ['Overdue Bills', stats.overdueBills.toString(), ''],
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily-summary-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast('Daily summary report has been exported to CSV', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      toast('Failed to export report. Please try again.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary-800">Daily Summary</h1>
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
        <h1 className="text-2xl font-bold text-secondary-800">Daily Summary</h1>
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
                <Calendar className="w-4 h-4 inline mr-1" />
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
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-100">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Total Visits</p>
                <p className={cn('text-2xl font-bold text-secondary-800')}>{stats.totalVisits}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success-100">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Completed Visits</p>
                <p className={cn('text-2xl font-bold text-success-600')}>{stats.completedVisits}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning-100">
                <AlertCircle className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Pending Bills</p>
                <p className={cn('text-2xl font-bold text-warning-600')}>{stats.pendingBills}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={cardMount}>
          <Card className="h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success-100">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-500">Total Revenue</p>
                <p className={cn('text-2xl font-bold text-success-600')}>{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Trend Chart */}
        <motion.div variants={cardMount} initial="initial" animate="animate">
          <Card className="h-full">
            <CardHeader title="Visits Trend" />
            <CardBody>
              {visitsTrendData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitsTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="visits" fill={THEME_COLORS.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill={THEME_COLORS.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-secondary-500">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                    <p>No visit data available for the selected period</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Visit Status Distribution */}
        <motion.div variants={cardMount} initial="initial" animate="animate">
          <Card className="h-full">
            <CardHeader title="Visit Status Distribution" />
            <CardBody>
              {visitStatusData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={visitStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {visitStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value: number) => [value, 'Visits']}
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
              ) : (
                <div className="h-64 flex items-center justify-center text-secondary-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                    <p>No visit status data available</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Bill Status Section */}
      <motion.div variants={cardMount} initial="initial" animate="animate">
        <Card>
          <CardHeader title="Bill Status Overview" />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                <div>
                  <p className="text-sm text-success-700">Paid Bills</p>
                  <p className="text-2xl font-bold text-success-800">{stats.paidBills}</p>
                </div>
                <Badge variant="success" className="text-sm">
                  Paid
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg">
                <div>
                  <p className="text-sm text-warning-700">Pending Bills</p>
                  <p className="text-2xl font-bold text-warning-800">{stats.pendingBills}</p>
                </div>
                <Badge variant="warning" className="text-sm">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-danger-50 rounded-lg">
                <div>
                  <p className="text-sm text-danger-700">Overdue Bills</p>
                  <p className="text-2xl font-bold text-danger-800">{stats.overdueBills}</p>
                </div>
                <Badge variant="danger" className="text-sm">
                  Overdue
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Summary Period Info */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <p className="text-sm text-secondary-500 text-center">
          Showing data from {formatDate(startDate)} to {formatDate(endDate)}
        </p>
      </motion.div>
    </motion.div>
  );
}
