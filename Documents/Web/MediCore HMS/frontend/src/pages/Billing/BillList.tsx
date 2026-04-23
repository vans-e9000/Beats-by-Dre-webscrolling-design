import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, X } from 'lucide-react';
import { motion } from 'motion/react';
import { pageEnter } from '@/utils/motion';
import { Button, Card, CardHeader, CardBody, Badge, TableSkeleton, Input, Select } from '@/components';
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

const statusOptions: { value: Bill['status'] | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BillList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Bill['status'] | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBills({ 
    page, 
    limit: 25,
    search,
    status: statusFilter || undefined,
  });

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
      render: (bill: Bill) => bill.dueDate ? formatDate(bill.dueDate) : 'N/A',
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
          className="p-1 text-secondary-400 hover:text-primary-600"
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
          <div className="flex gap-4">
            <Select
              options={statusOptions}
              value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as Bill['status'] | '');
                  setPage(1);
                }}
              className="w-40"
            />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <Input
                type="text"
                placeholder="Search patient or bill #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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

      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1 || !data.pagination.hasPrev}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-secondary-600">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.pagination.totalPages || !data.pagination.hasNext}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
}
