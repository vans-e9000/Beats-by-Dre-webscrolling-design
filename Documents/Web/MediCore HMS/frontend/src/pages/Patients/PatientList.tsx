import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { pageEnter } from '@/utils/motion';
import { Button, Card, CardHeader, CardBody, Badge, Input } from '@/components';
import { TableSkeleton } from '@/components';
import Table from '@/components/common/Table';
import { Patient } from '@/types';
import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { useToast } from '@/store/ToastContext';

type PatientRow = Patient & Record<string, unknown>;

export default function PatientList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePatients({ search, page, limit: 25 });
  const deletePatient = useDeletePatient();

  const columns = [
    {
      key: 'patientNumber',
      header: 'Patient #',
      render: (patient: PatientRow) => (
        <span className="font-medium">{patient.patientNumber}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (patient: PatientRow) => `${patient.firstName} ${patient.lastName}`,
    },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    {
      key: 'status',
      header: 'Status',
      render: (patient: PatientRow) => (
        <Badge variant={patient.status === 'active' ? 'success' : 'default'}>
          {patient.status as string}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (patient: PatientRow) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${patient.id}`);
            }}
            className="p-1 text-secondary-400 hover:text-primary-600"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${patient.id}/edit`);
            }}
            className="p-1 text-secondary-400 hover:text-primary-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(patient.id as string);
            }}
            className="p-1 text-secondary-400 hover:text-danger-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient.mutateAsync(id);
        toast('Patient deleted successfully');
      } catch {
        toast('Failed to delete patient', 'error');
      }
    }
  };

  const patients = (data?.data || []) as PatientRow[];

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-800">Patients</h2>
        <Button onClick={() => navigate('/patients/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Patient List"
          action={
            <div className="w-64">
              <Input
                icon={Search}
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <CardBody>
            <Table<PatientRow>
              columns={columns}
              data={patients}
              keyField="id"
              onRowClick={(patient) => navigate(`/patients/${patient.id as string}`)}
              emptyMessage="No patients found"
            />
          </CardBody>
        )}
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
