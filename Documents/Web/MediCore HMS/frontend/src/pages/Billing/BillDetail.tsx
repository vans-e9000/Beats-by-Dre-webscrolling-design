import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, CreditCard, DollarSign, CheckCircle, AlertTriangle, ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pageEnter, staggerContainer, cardMount } from '@/utils/motion';
import { paymentSchema, PaymentFormData } from '@/utils/validators';
import { useBill, useAddPayment, useUpdateBill, useDeleteBill } from '@/hooks/useBills';
import { useToast } from '@/store/ToastContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { BillItem, Bill } from '@/types';
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

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading } = useBill(id!);
  const addPayment = useAddPayment();
  const updateBill = useUpdateBill();
  const deleteBill = useDeleteBill();

  const bill = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'cash',
      referenceNumber: '',
      notes: '',
    },
  });

  // Update default amount when bill loads
  useEffect(() => {
    if (bill?.balance) {
      reset({
        amount: bill.balance,
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
      });
    }
  }, [bill, reset]);

  const onPaymentSubmit = async (formData: PaymentFormData) => {
    try {
      await addPayment.mutateAsync({
        billId: id!,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      });
      toast('Payment recorded successfully');
      setShowPaymentModal(false);
      reset();
    } catch (error) {
      toast('Failed to record payment', 'error');
      console.error('Payment failed:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    try {
      await updateBill.mutateAsync({
        id: id!,
        bill: { status: selectedStatus as Bill['status'] },
      });
      toast(`Bill status updated to ${selectedStatus}`);
      setShowStatusModal(false);
      setSelectedStatus('');
    } catch (error) {
      toast('Failed to update status', 'error');
      console.error('Status update failed:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBill.mutateAsync(id!);
      toast('Bill cancelled successfully');
      navigate('/billing');
    } catch (error) {
      toast('Failed to cancel bill', 'error');
      console.error('Delete failed:', error);
    }
  };

const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow || !bill) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Bill #${bill.billNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #333; padding-bottom: 10px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { font-size: 12px; color: #666; }
          .bill-info { margin-bottom: 20px; }
          .bill-info .row { display: flex; justify-content: space-between; margin: 5px 0; }
          .bill-info .label { color: #666; }
          .items { margin: 20px 0; border-top: 1px dashed #333; padding-top: 10px; }
          .items .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .totals { margin-top: 20px; border-top: 1px dashed #333; padding-top: 10px; }
          .totals .row { display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; }
          .totals .total { font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediCore HMS</h1>
          <p>Hospital Management System</p>
        </div>
        <div class="bill-info">
          <div class="row"><span class="label">Receipt #:</span><span>${bill.billNumber}</span></div>
          <div class="row"><span class="label">Date:</span><span>${new Date(bill.createdAt).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Patient:</span><span>${bill.patient?.firstName || 'N/A'} ${bill.patient?.lastName || ''}</span></div>
          <div class="row"><span class="label">Status:</span><span>${bill.status.toUpperCase()}</span></div>
        </div>
        <div class="items">
          ${(bill.items || []).map((item: BillItem) => `
            <div class="item">
              <span>${item.serviceName} x${item.quantity}</span>
              <span>${formatCurrency(item.quantity * item.unitPrice)}</span>
            </div>
          `).join('')}
        </div>
        <div class="totals">
 <div class="row"><span>Subtotal:</span><span>${formatCurrency(bill.subtotal || 0)}</span></div>
    <div class="row"><span>Tax:</span><span>${formatCurrency(bill.tax || 0)}</span></div>
    <div class="row"><span>Discount:</span><span>-${formatCurrency(bill.discount || 0)}</span></div>
    <div class="row total"><span>TOTAL:</span><span>${formatCurrency(bill.totalAmount)}</span></div>
    <div class="row"><span>Paid:</span><span>${formatCurrency(bill.paidAmount || 0)}</span></div>
    <div class="row"><span>Balance:</span><span>${formatCurrency(bill.balance || 0)}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for choosing MediCore HMS</p>
          <p>Print Date: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
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
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/billing')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bills
        </Button>
      </motion.div>
    );
  }

  const itemColumns = [
    { key: 'serviceName', header: 'Description' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (row: BillItem) => formatCurrency(row.unitPrice),
    },
    {
      key: 'subtotal',
      header: 'Total',
      render: (row: BillItem) => formatCurrency(row.quantity * row.unitPrice),
    },
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'insurance', label: 'Insurance' },
  ];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/billing')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Bill #{bill.billNumber}</h1>
            <p className="text-secondary-500">
              Patient: {bill.patient?.firstName} {bill.patient?.lastName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {bill.balance > 0 && bill.status !== 'cancelled' && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          )}
          {bill.status !== 'cancelled' && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel Bill
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
                <div className={cn('p-2 rounded-lg bg-success-50')}>
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-success-600">{formatCurrency(bill.paidAmount || 0)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        <motion.div variants={cardMount}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', bill.balance > 0 ? 'bg-warning-50' : 'bg-success-50')}>
                  <AlertTriangle className={cn('w-5 h-5', bill.balance > 0 ? 'text-warning-600' : 'text-success-600')} />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Balance</p>
                  <p className={cn('text-2xl font-bold', bill.balance > 0 ? 'text-warning-600' : 'text-success-600')}>
                    {formatCurrency(bill.balance || 0)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Status & Due Date */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={statusVariant[bill.status]}>{bill.status}</Badge>
              <span className="text-secondary-500">Due Date: {bill.dueDate ? formatDate(bill.dueDate) : 'N/A'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => {
              setSelectedStatus(bill.status);
              setShowStatusModal(true);
            }}>
              <Edit3 className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        </CardBody>
      </Card>

<Card>
        <CardHeader title="Bill Items" />
        <CardBody className="p-0">
          <Table<BillItem>
            columns={itemColumns}
            data={bill.items || []}
            keyField="id"
            emptyMessage="No items in this bill"
          />
        </CardBody>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm text-secondary-500">Created: {formatDate(bill.createdAt)}</p>
            {bill.notes && <p className="text-sm text-secondary-500 mt-1">Notes: {bill.notes}</p>}
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm text-secondary-500">Subtotal: {formatCurrency(bill.subtotal || 0)}</p>
            <p className="text-sm text-secondary-500">Tax: {formatCurrency(bill.tax || 0)}</p>
            {bill.discount > 0 && (
              <p className="text-sm text-secondary-500">Discount: -{formatCurrency(bill.discount)}</p>
            )}
            <p className="text-lg font-bold border-t pt-2">Total: {formatCurrency(bill.totalAmount)}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Payment History */}
      {bill.payments && bill.payments.length > 0 && (
        <Card>
          <CardHeader title="Payment History" />
          <CardBody>
            <div className="space-y-3">
              {bill.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-secondary-500">{payment.paymentMethod} • {formatDate(payment.paidAt)}</p>
                    {payment.notes && <p className="text-sm text-secondary-400">{payment.notes}</p>}
                  </div>
                  {payment.referenceNumber && (
                    <Badge variant="secondary">Ref: {payment.referenceNumber}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

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
                max={bill.balance}
                {...register('amount', { valueAsNumber: true })}
              />
              <p className="text-sm text-secondary-500 mt-1">
                Balance: {formatCurrency(bill.balance)}
              </p>
            </FormField>
            <FormField label="Payment Method" error={errors.paymentMethod?.message} required>
              <Select
                options={paymentMethodOptions}
                {...register('paymentMethod')}
              />
            </FormField>
            <FormField label="Reference Number (Optional)">
              <Input 
                placeholder="Transaction ID, Check #, etc."
                {...register('referenceNumber')} 
              />
            </FormField>
            <FormField label="Notes">
              <Input 
                placeholder="Optional notes about this payment"
                {...register('notes')} 
              />
            </FormField>
          </CardBody>
          <CardFooter>
            <FormActions>
              <Button variant="secondary" type="button" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting || addPayment.isPending}>
                Record Payment
              </Button>
            </FormActions>
          </CardFooter>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus('');
        }}
        title="Update Bill Status"
      >
        <CardBody>
          <FormField label="New Status" required>
            <Select
              options={[{ value: '', label: 'Select status...' }, ...statusOptions]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </FormField>
          <p className="text-sm text-secondary-500 mt-4">
            Current status: <Badge variant={statusVariant[bill.status]}>{bill.status}</Badge>
          </p>
        </CardBody>
        <CardFooter>
          <FormActions>
            <Button variant="secondary" type="button" onClick={() => {
              setShowStatusModal(false);
              setSelectedStatus('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              isLoading={updateBill.isPending}
              disabled={!selectedStatus || selectedStatus === bill.status}
            >
              Update Status
            </Button>
          </FormActions>
        </CardFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Cancel Bill"
      >
        <CardBody>
          <p className="text-secondary-700">
            Are you sure you want to cancel this bill? This action cannot be undone.
          </p>
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-800">
              <strong>Bill #{bill.billNumber}</strong> for {formatCurrency(bill.totalAmount)}
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <FormActions>
            <Button variant="secondary" type="button" onClick={() => setShowDeleteModal(false)}>
              Keep Bill
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteBill.isPending}
            >
              Cancel Bill
            </Button>
          </FormActions>
        </CardFooter>
      </Modal>
    </motion.div>
  );
}
