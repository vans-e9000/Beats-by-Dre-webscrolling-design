import { Users, CreditCard, Activity, TrendingUp, UserPlus, FileText, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { pageEnter, staggerContainer, cardMount } from '@/utils/motion';
import { useAuth } from '@/store/AuthContext';
import { Card, CardHeader, CardBody, Badge, Button, CardSkeleton } from '@/components';
import RevenueChart from '@/components/charts/RevenueChart';
import PatientChart from '@/components/charts/PatientChart';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/format';
import { reportsService, DateRange } from '@/services/reports';
import { useQuery } from '@tanstack/react-query';

const statIcons = [
  { icon: Users, label: 'Total Patients' },
  { icon: CreditCard, label: 'Total Revenue' },
  { icon: Activity, label: 'Pending Bills' },
  { icon: TrendingUp, label: 'New Patients' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const dateRange: DateRange = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: today,
  };

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: () => reportsService.getDailySummary(today),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenueByDate', dateRange],
    queryFn: () => reportsService.getRevenueByDate(dateRange),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 bg-secondary-100 rounded mb-2" />
          <div className="h-5 w-48 bg-secondary-100 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Patients', value: summary?.data?.totalPatients || 0, icon: Users },
    { label: 'Total Revenue', value: formatCurrency(summary?.data?.totalRevenue || 0), icon: CreditCard },
    { label: 'Pending Bills', value: summary?.data?.pendingPayments || 0, icon: Activity },
    { label: 'New Patients', value: summary?.data?.newPatients || 0, icon: TrendingUp },
  ];

  return (
    <motion.div
      variants={pageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-secondary-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-secondary-600">Here's what's happening today.</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={cardMount}>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">{stat.label}</p>
                  <p className="text-xl font-semibold text-secondary-800">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Revenue Overview" />
          <CardBody>
            <RevenueChart data={revenueData?.data || []} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Patient Overview" />
          <CardBody>
            <PatientChart data={revenueData?.data || []} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Bills" />
          <CardBody>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-secondary-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-secondary-800">BILL00{i}</p>
                    <p className="text-sm text-secondary-500">Patient Name</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-800">{formatCurrency(1000)}</p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody className="space-y-3">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <UserPlus className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-secondary-800">Register Patient</p>
                <p className="text-sm text-secondary-500">Add new patient</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-secondary-800">Create Bill</p>
                <p className="text-sm text-secondary-500">Generate new invoice</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-secondary-800">View Reports</p>
                <p className="text-sm text-secondary-500">Daily summary</p>
              </div>
            </Button>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}
