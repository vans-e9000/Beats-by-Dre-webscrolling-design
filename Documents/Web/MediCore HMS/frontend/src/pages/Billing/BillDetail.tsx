import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, CreditCard, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pageEnter, staggerContainer, cardMount } from '@/utils/motion';
import { paymentSchema, PaymentFormData } from '@/utils/validators';
import { useBill, useAddPayment } from '@/hooks/useBills';
import { formatCurrency, formatDate } from '@/utils/format';
import { Card, CardHeader, CardBody, CardFooter, Button, Badge, Modal, Input, Select, TableSkeleton } from '@/components';
import Table from '@/components/common/Table';
import FormField from '@/components/forms/FormField';
import FormActions from '@/components/forms/FormActions';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  partial: 'info',
  overdue: 'danger',
};

interface BillItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function BillDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data, isLoading } = useBill(id!);
  const addPayment = useAddPayment();

  const bill = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: bill?.balance,
      method: 'cash',
    },
  });

  const onPaymentSubmit = async (data: PaymentFormData) => {
    try {
      await addPayment.mutateAsync({
        billId: id!,
        amount: data.amount,
        method: data.method,
        notes: data.notes,
      });
      setShowPaymentModal(false);
      reset();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <TableSkeleton rows={4} />
      </motion.div>
    );
  }

  if (!bill) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="text-center py-8">
        <p className="text-secondary-500">Bill not found</p>
      </motion.div>
    );
  }

  const itemColumns = [
    { key: 'description', header: 'Description' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (row: BillItemRow) => formatCurrency(row.unitPrice),
    },
    {
      key: 'total',
      header: 'Total',
      render: (row: BillItemRow) => formatCurrency(row.total),
    },
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Bill #{bill.billNumber}</h1>
          <p className="text-secondary-500">
            Patient: {bill.patient?.firstName} {bill.patient?.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          {bill.balance > 0 && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="w-4 h-4" />
              Add Payment
            </Button>
          )}
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={cardMount}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-primary-50')}>
                  <DollarSign className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Total Amount</p>
                  <p className="text-2xl font-bold text-secondary-900">{formatCurrency(bill.totalAmount)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        <motion.div variants={cardMount}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-primary-50')}>
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-success-600">{formatCurrency(bill.paidAmount)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        <motion.div variants={cardMount}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-primary-50')}>
                  <AlertTriangle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Balance</p>
                  <p className="text-2xl font-bold text-warning-600">{formatCurrency(bill.balance)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between">
        <Badge variant={statusVariant[bill.status]}>{bill.status}</Badge>
        <p className="text-secondary-500">Due Date: {formatDate(bill.dueDate)}</p>
      </div>

      <Card>
        <CardHeader title="Bill Items" />
        <CardBody className="p-0">
          <Table<BillItemRow>
            columns={itemColumns}
            data={bill.items as BillItemRow[]}
            keyField="id"
          />
        </CardBody>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm text-secondary-500">Created: {formatDate(bill.createdAt)}</p>
            {bill.notes && <p className="text-sm text-secondary-500 mt-1">Notes: {bill.notes}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Total: {formatCurrency(bill.totalAmount)}</p>
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <form onSubmit={handleSubmit(onPaymentSubmit)}>
          <CardBody>
            <FormField label="Amount" error={errors.amount?.message} required>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Payment Method" error={errors.method?.message} required>
              <Select
                options={paymentMethodOptions}
                {...register('method')}
              />
            </FormField>
            <FormField label="Notes">
              <Input placeholder="Optional notes" {...register('notes')} />
            </FormField>
          </CardBody>
          <CardFooter>
            <FormActions>
              <Button variant="secondary" type="button" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Record Payment
              </Button>
            </FormActions>
          </CardFooter>
        </form>
      </Modal>
    </motion.div>
  );
}
