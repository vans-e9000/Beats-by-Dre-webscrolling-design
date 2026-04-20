import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { pageEnter } from '@/utils/motion';
import { Button, Card, CardHeader, CardBody, Badge, CardSkeleton } from '@/components';
import { usePatient } from '@/hooks/usePatients';
import { formatDate, formatPhone, formatCurrency } from '@/utils/format';
import { GENDER_OPTIONS, BLOOD_GROUPS } from '@/utils/constants';
import { billsService } from '@/services/bills';
import { useQuery } from '@tanstack/react-query';

const billBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'danger',
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);

  const { data: bills } = useQuery({
    queryKey: ['patientBills', id],
    queryFn: () => billsService.getByPatient(id!),
    enabled: !!id,
  });

  if (isLoading) return <CardSkeleton />;

  if (!patient?.data) return <div>Patient not found</div>;

  const p = patient.data;

  const genderLabel = GENDER_OPTIONS.find((g) => g.value === p.gender)?.label || p.gender;
  const bloodGroupLabel = BLOOD_GROUPS.find((b) => b.value === p.bloodGroup)?.label || p.bloodGroup;

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-secondary-800">
            {p.firstName} {p.lastName}
          </h2>
          <Badge variant={p.status === 'active' ? 'success' : 'default'}>
            {p.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/patients/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => navigate('/billing/new', { state: { patientId: id } })}>
            <CreditCard className="w-4 h-4 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Patient Information" />
          <CardBody>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-500">Patient Number</p>
                <p className="font-medium text-secondary-800">{p.patientNumber}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Date of Birth</p>
                <p className="font-medium text-secondary-800">{formatDate(p.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Gender</p>
                <p className="font-medium text-secondary-800">{genderLabel}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Phone</p>
                <p className="font-medium text-secondary-800">{formatPhone(p.phone)}</p>
              </div>
              {p.email && (
                <div>
                  <p className="text-sm text-secondary-500">Email</p>
                  <p className="font-medium text-secondary-800">{p.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-secondary-500">Address</p>
                <p className="font-medium text-secondary-800">{p.address}</p>
                <p className="text-sm text-secondary-500">
                  {p.city}, {p.state}
                </p>
              </div>
              {p.emergencyContact && (
                <div>
                  <p className="text-sm text-secondary-500">Emergency Contact</p>
                  <p className="font-medium text-secondary-800">{p.emergencyContact}</p>
                  {p.emergencyPhone && (
                    <p className="text-sm text-secondary-600">{formatPhone(p.emergencyPhone)}</p>
                  )}
                </div>
              )}
              {p.bloodGroup && (
                <div>
                  <p className="text-sm text-secondary-500">Blood Group</p>
                  <p className="font-medium text-secondary-800">{bloodGroupLabel}</p>
                </div>
              )}
            </div>

            {(p.allergies || p.medicalHistory) && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <div className="grid grid-cols-2 gap-6">
                  {p.allergies && (
                    <div>
                      <p className="text-sm text-secondary-500">Allergies</p>
                      <p className="font-medium text-secondary-800">{p.allergies}</p>
                    </div>
                  )}
                  {p.medicalHistory && (
                    <div>
                      <p className="text-sm text-secondary-500">Medical History</p>
                      <p className="font-medium text-secondary-800">{p.medicalHistory}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Bill Summary" />
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Total Bills</span>
                  <span className="font-medium text-secondary-800">{bills?.data?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Paid</span>
                  <span className="font-medium text-success-600">
                    {formatCurrency(
                      bills?.data
                        ?.filter((b) => b.status === 'paid')
                        .reduce((sum, b) => sum + b.paidAmount, 0) || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Pending</span>
                  <span className="font-medium text-warning-600">
                    {formatCurrency(
                      bills?.data
                        ?.filter((b) => b.status !== 'paid')
                        .reduce((sum, b) => sum + b.balance, 0) || 0
                    )}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Bills" />
            <CardBody>
              {bills?.data?.length === 0 ? (
                <p className="text-sm text-secondary-500">No bills found</p>
              ) : (
                <div className="space-y-3">
                  {bills?.data?.slice(0, 5).map((bill) => (
                    <button
                      key={bill.id}
                      onClick={() => navigate(`/billing/${bill.id}`)}
                      className={cn(
                        'w-full p-3 text-left rounded-lg transition-colors',
                        'bg-secondary-50 hover:bg-secondary-100'
                      )}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-secondary-800">{bill.billNumber}</span>
                        <Badge variant={billBadgeVariant[bill.status] || 'default'}>
                          {bill.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-500">
                        {formatDate(bill.createdAt)}
                      </p>
                      <p className="font-medium text-secondary-800 mt-1">{formatCurrency(bill.totalAmount)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
