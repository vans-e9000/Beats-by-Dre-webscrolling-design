import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsService, BillFilters, CreateBillData, PaymentData } from '@/services/bills';

export function useBills(filters: BillFilters = {}) {
  return useQuery({
    queryKey: ['bills', filters],
    queryFn: () => billsService.getAll(filters),
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: ['bill', id],
    queryFn: () => billsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bill: CreateBillData) => billsService.create(bill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bill }: { id: string; bill: Partial<CreateBillData> }) =>
      billsService.update(id, bill),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', variables.id] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: PaymentData) => billsService.addPayment(payment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', variables.billId] });
    },
  });
}

export function usePatientBills(patientId: string) {
  return useQuery({
    queryKey: ['bills', 'patient', patientId],
    queryFn: () => billsService.getByPatient(patientId),
    enabled: !!patientId,
  });
}