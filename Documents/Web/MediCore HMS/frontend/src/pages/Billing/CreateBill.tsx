import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pageEnter } from '@/utils/motion';
import { billSchema, BillFormData } from '@/utils/validators';
import { usePatients } from '@/hooks/usePatients';
import { useCreateBill } from '@/hooks/useBills';
import { servicesService } from '@/services/services';
import { useToast } from '@/store/ToastContext';
import { formatCurrency } from '@/utils/format';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select } from '@/components';
import FormField from '@/components/forms/FormField';

export default function CreateBill() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  const { data: patients } = usePatients({ limit: 100 });
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.getAll(),
  });

  const createBill = useCreateBill();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      patientId: '',
      dueDate: new Date().toISOString().split('T')[0],
      items: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  const total = watchItems?.reduce((sum, item) => {
    return sum + (item.quantity * (item.unitPrice || 0));
  }, 0) || 0;

  const onSubmit = async (data: BillFormData) => {
    try {
      const items = data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      await createBill.mutateAsync({
        patientId: data.patientId,
        dueDate: data.dueDate,
        items,
        notes: data.notes,
      });

      toast('Bill created successfully');
      navigate('/billing');
    } catch {
      toast('Failed to create bill', 'error');
    }
  };

  const handleAddItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0 });
  };

  const handleSelectService = (index: number, service: { id: string; name: string; price: number }) => {
    setValue(`items.${index}.description`, service.name);
    setValue(`items.${index}.unitPrice`, service.price);
  };

  const patientOptions = patients?.data.map((p) => ({
    value: p.id,
    label: `${p.patientNumber} - ${p.firstName} ${p.lastName}`,
  })) || [];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="max-w-4xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Create Bill</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader title="Patient Information" />
          <CardBody>
            <FormField label="Patient" error={errors.patientId?.message} required>
              <Select
                options={patientOptions}
                value={selectedPatient}
                onChange={(e) => {
                  setSelectedPatient(e.target.value);
                  setValue('patientId', e.target.value);
                }}
              />
            </FormField>

            <FormField label="Due Date" error={errors.dueDate?.message} required>
              <Input type="date" {...register('dueDate')} />
            </FormField>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardHeader
            title="Bill Items"
            action={
              <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            }
          />
          <CardBody>
            {fields.length === 0 ? (
              <p className="text-center text-secondary-500 py-4">No items added yet</p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Description"
                        {...register(`items.${index}.description`)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-32 text-right py-2">
                      {formatCurrency((watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0))}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className={cn('p-2 text-danger-600 hover:bg-danger-50 rounded')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.items?.message && (
              <p className="text-danger-600 text-sm mt-2">{errors.items.message}</p>
            )}
          </CardBody>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total</p>
              <p className="text-2xl font-bold text-secondary-900">{formatCurrency(total)}</p>
            </div>
          </CardFooter>
        </Card>

        <Card className="mt-6">
          <CardHeader title="Additional Information" />
          <CardBody>
            <FormField label="Notes">
              <textarea
                className={cn(
                  'w-full min-h-[100px] px-3 py-2 border border-secondary-200 rounded-md',
                  'text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
                placeholder="Additional notes"
                {...register('notes')}
              />
            </FormField>
          </CardBody>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/billing')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createBill.isPending}>
            Create Bill
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
