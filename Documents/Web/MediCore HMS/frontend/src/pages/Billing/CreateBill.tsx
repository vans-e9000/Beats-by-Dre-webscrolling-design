import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pageEnter } from '@/utils/motion';
import { billSchema, BillFormData } from '@/utils/validators';
import { usePatients } from '@/hooks/usePatients';
import { useVisits } from '@/hooks/useVisits';
import { useServices } from '@/hooks/useServices';
import { useCreateBill } from '@/hooks/useBills';
import { useToast } from '@/store/ToastContext';
import { formatCurrency } from '@/utils/format';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Select, Badge } from '@/components';
import FormField from '@/components/forms/FormField';
import Modal from '@/components/common/Modal';
import { Service } from '@/types';

interface ServiceItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateBill() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<string>('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

  const { data: patients } = usePatients({ limit: 100 });
  const { data: visits } = useVisits({ patientId: selectedPatient || undefined });
  const { data: servicesData } = useServices();
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
      visitId: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      notes: '',
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  const total = watchItems?.reduce((sum, item) => {
    return sum + (item.quantity * (item.unitPrice || 0));
  }, 0) || 0;

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!servicesData?.data) return [];
    if (!serviceSearch) return servicesData.data;
    return servicesData.data.filter((s: Service) => 
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category?.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [servicesData, serviceSearch]);

  // Get services already added to prevent duplicates
  const addedServiceIds = useMemo(() => 
    new Set(watchItems?.map((item: ServiceItem) => item.serviceId).filter(Boolean)),
    [watchItems]
  );

  const patientOptions = useMemo(() => 
    patients?.data.map((p) => ({
      value: p.id,
      label: `${p.patientCode} - ${p.firstName} ${p.lastName}`,
    })) || [],
    [patients]
  );

  const visitOptions = useMemo(() => 
    visits?.data.map((v) => ({
      value: v.id,
      label: `Visit ${v.visitNumber} - ${new Date(v.visitDate).toLocaleDateString()} (${v.status})`,
    })) || [],
    [visits]
  );

  const onSubmit = async (data: BillFormData) => {
    try {
      await createBill.mutateAsync(data);
      toast('Bill created successfully');
      navigate('/billing');
    } catch (error) {
      toast('Failed to create bill', 'error');
      console.error('Create bill error:', error);
    }
  };

  const handleAddServiceFromApi = (service: Service) => {
    const existingIndex = fields.findIndex((_, index) => 
      watchItems[index]?.serviceId === service.id
    );

    if (existingIndex >= 0) {
      // Update quantity if service already exists
      const existingItem = watchItems[existingIndex];
      update(existingIndex, {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      });
    } else {
      // Add new service
      append({
        serviceId: service.id,
        serviceName: service.name,
        quantity: 1,
        unitPrice: service.price,
      });
    }
    setServiceSearch('');
    setShowServiceModal(false);
  };

  const handleAddManualItem = () => {
    append({
      serviceName: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  // Update form values when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setValue('patientId', selectedPatient);
      setSelectedVisit('');
      setValue('visitId', '');
    }
  }, [selectedPatient, setValue]);

  // Update form values when visit changes
  useEffect(() => {
    if (selectedVisit) {
      setValue('visitId', selectedVisit);
    }
  }, [selectedVisit, setValue]);

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="max-w-4xl">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Create Bill</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader title="Patient Information" />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Patient" error={errors.patientId?.message} required>
                <Select
                  options={[{ value: '', label: 'Select a patient...' }, ...patientOptions]}
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                />
              </FormField>

              <FormField label="Visit" error={errors.visitId?.message} required>
                <Select
                  options={[{ value: '', label: selectedPatient ? 'Select a visit...' : 'Select patient first' }, ...visitOptions]}
                  value={selectedVisit}
                  onChange={(e) => setSelectedVisit(e.target.value)}
                  disabled={!selectedPatient}
                />
              </FormField>
            </div>

            <FormField label="Due Date" error={errors.dueDate?.message} required className="mt-4">
              <Input type="date" {...register('dueDate')} />
            </FormField>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardHeader
            title="Bill Items"
            action={
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowServiceModal(true)}>
                  <Search className="w-4 h-4 mr-1" />
                  Add Service
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddManualItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Manual Entry
                </Button>
              </div>
            }
          />
          <CardBody>
            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-secondary-200 rounded-lg">
                <p className="text-secondary-500 mb-4">No items added yet</p>
                <div className="flex justify-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowServiceModal(true)}>
                    <Search className="w-4 h-4 mr-1" />
                    Add from Services
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddManualItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Manual Entry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-secondary-500 mb-1">Service</label>
                      <Input
                        placeholder="Service name"
                        {...register(`items.${index}.serviceName`)}
                        className="bg-white"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-secondary-500 mb-1">Qty</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="bg-white"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-secondary-500 mb-1">Unit Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        className="bg-white"
                      />
                    </div>
                    <div className="w-32 text-right py-6">
                      <p className="text-lg font-bold text-secondary-900">
                        {formatCurrency((watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className={cn('p-2 text-danger-600 hover:bg-danger-50 rounded mt-5')}
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
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div>
              <p className="text-sm text-secondary-500">Total Items: {fields.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary-500">Grand Total</p>
              <p className="text-3xl font-bold text-secondary-900">{formatCurrency(total)}</p>
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
                  'text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'resize-y'
                )}
                placeholder="Additional notes about this bill..."
                {...register('notes')}
              />
            </FormField>
          </CardBody>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/billing')} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={createBill.isPending}
            disabled={fields.length === 0 || !selectedPatient || !selectedVisit}
          >
            Create Bill ({formatCurrency(total)})
          </Button>
        </div>
      </form>

      {/* Service Selection Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setServiceSearch('');
        }}
        title="Add Service from Catalog"
        size="lg"
      >
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <Input
              type="text"
              placeholder="Search services by name or category..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredServices.length === 0 ? (
              <p className="text-center text-secondary-500 py-8">
                {serviceSearch ? 'No services found' : 'No services available'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service: Service) => {
                  const isAdded = addedServiceIds.has(service.id);
                  return (
                    <div
                      key={service.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors',
                        isAdded 
                          ? 'border-success-200 bg-success-50' 
                          : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                      )}
                      onClick={() => !isAdded && handleAddServiceFromApi(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-secondary-900">{service.name}</p>
                          {service.category && (
<Badge variant="secondary" className="mt-1">
                            {service.category}
                          </Badge>
                          )}
                          {service.description && (
                            <p className="text-sm text-secondary-500 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-secondary-900">{formatCurrency(service.price)}</p>
                          {isAdded && (
                            <Badge variant="success" className="mt-1">
                              Already added
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button variant="secondary" onClick={() => {
            setShowServiceModal(false);
            setServiceSearch('');
          }}>
            Close
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
