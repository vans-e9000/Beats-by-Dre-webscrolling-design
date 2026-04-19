import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pageEnter, staggerContainer, cardMount } from '@/utils/motion';
import { Button, Card, CardHeader, CardBody, Badge, TableSkeleton, Input } from '@/components';
import Table from '@/components/common/Table';
import { Bill } from '@/types';
import { useBills } from '@/hooks/useBills';
import { formatCurrency, formatDate } from '@/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  partial: 'info',
  overdue: 'danger',
};

export default function BillList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBills({ page, limit: 25 });

  const columns = [
    { key: 'billNumber', header: 'Bill #' },
    {
      key: 'patient',
      header: 'Patient',
      render: (bill: Bill) =>
        bill.patient ? `${bill.patient.firstName} ${bill.patient.lastName}` : '-',
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (bill: Bill) => formatCurrency(bill.totalAmount),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (bill: Bill) => formatCurrency(bill.balance),
    },
    {
      key: 'status',
      header: 'Status',
      render: (bill: Bill) => (
        <Badge variant={statusVariant[bill.status]}>{bill.status}</Badge>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (bill: Bill) => formatDate(bill.dueDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (bill: Bill) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/billing/${bill.id}`);
          }}
          className={cn('p-1 text-secondary-400 hover:text-primary-600')}
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary-900">Bills</h2>
        </div>
        <Card>
          <CardBody>
            <TableSkeleton rows={6} />
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900">Bills</h2>
        <Button onClick={() => navigate('/billing/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bill
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Bill List"
          action={
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <Input
                type="text"
                placeholder="Search bills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          }
        />
        <CardBody>
          <Table<Bill>
            columns={columns}
            data={data?.data || []}
            keyField="id"
            onRowClick={(bill) => navigate(`/billing/${bill.id}`)}
            emptyMessage="No bills found"
          />
        </CardBody>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-secondary-600">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
}
