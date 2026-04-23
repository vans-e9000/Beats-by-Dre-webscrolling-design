import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { pageEnter } from '@/utils/motion';
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Select } from '@/components';
import FormField from '@/components/forms/FormField';
import FormActions from '@/components/forms/FormActions';
import FormError from '@/components/forms/FormError';
import { useCreatePatient, useUpdatePatient, usePatient } from '@/hooks/usePatients';
import { useToast } from '@/store/ToastContext';
import { patientSchema, PatientFormData } from '@/utils/validators';
import { GENDER_OPTIONS, BLOOD_GROUPS } from '@/utils/constants';

export default function PatientRegistration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const { data: patientData } = usePatient(id!);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: isEdit && patientData?.data ? {
      firstName: patientData.data.firstName,
      lastName: patientData.data.lastName,
      dateOfBirth: patientData.data.dateOfBirth,
      gender: patientData.data.gender,
      phone: patientData.data.phone,
      email: patientData.data.email,
      address: patientData.data.address,
      emergencyContactName: patientData.data.emergencyContactName,
      emergencyContactPhone: patientData.data.emergencyContactPhone,
      bloodGroup: patientData.data.bloodGroup,
      allergies: patientData.data.allergies,
      medicalHistory: patientData.data.medicalHistory,
      insuranceProvider: patientData.data.insuranceProvider,
      insurancePolicyNumber: patientData.data.insurancePolicyNumber,
      insuranceExpiry: patientData.data.insuranceExpiry,
    } : undefined,
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEdit && id) {
        await updatePatient.mutateAsync({ id, patient: data });
        toast('Patient updated successfully');
      } else {
        await createPatient.mutateAsync(data);
        toast('Patient registered successfully');
      }
      navigate('/patients');
    } catch {
      toast('An error occurred', 'error');
    }
  };

  const genderOptions = GENDER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }));
  const bloodGroupOptions = BLOOD_GROUPS.map((opt) => ({ value: opt.value, label: opt.label }));

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="max-w-3xl">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader title={isEdit ? 'Edit Patient' : 'Register Patient'} />
          <CardBody>
            <FormError />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName?.message} required>
                <Input
                  placeholder="Enter first name"
                  {...register('firstName')}
                />
              </FormField>

              <FormField label="Last Name" error={errors.lastName?.message} required>
                <Input
                  placeholder="Enter last name"
                  {...register('lastName')}
                />
              </FormField>

              <FormField label="Date of Birth" error={errors.dateOfBirth?.message} required>
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                />
              </FormField>

              <FormField label="Gender" error={errors.gender?.message} required>
                <Select
                  placeholder="Select gender"
                  options={genderOptions}
                  {...register('gender')}
                />
              </FormField>

              <FormField label="Phone" error={errors.phone?.message} required>
                <Input
                  placeholder="Enter phone number"
                  {...register('phone')}
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  placeholder="Enter email (optional)"
                  {...register('email')}
                />
              </FormField>

<FormField label="Address" error={errors.address?.message} required className="md:col-span-2">
            <Input
              placeholder="Enter address"
              {...register('address')}
            />
          </FormField>

          <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message}>
            <Input
              placeholder="Emergency contact name"
              {...register('emergencyContactName')}
            />
          </FormField>

          <FormField label="Emergency Phone" error={errors.emergencyContactPhone?.message}>
            <Input
              placeholder="Emergency phone"
              {...register('emergencyContactPhone')}
            />
          </FormField>

          <FormField label="Insurance Provider">
            <Input
              placeholder="Insurance provider"
              {...register('insuranceProvider')}
            />
          </FormField>

          <FormField label="Insurance Policy Number">
            <Input
              placeholder="Policy number"
              {...register('insurancePolicyNumber')}
            />
          </FormField>

          <FormField label="Insurance Expiry">
            <Input
              type="date"
              {...register('insuranceExpiry')}
            />
          </FormField>

              <FormField label="Blood Group">
                <Select
                  placeholder="Select blood group"
                  options={bloodGroupOptions}
                  {...register('bloodGroup')}
                />
              </FormField>

              <FormField label="Allergies">
                <Input
                  placeholder="Known allergies"
                  {...register('allergies')}
                />
              </FormField>

              <FormField label="Medical History" className="md:col-span-2">
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-secondary-200 bg-transparent px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Medical history"
                  {...register('medicalHistory')}
                />
              </FormField>
            </div>
          </CardBody>
          <CardFooter>
            <FormActions>
              <Button variant="secondary" onClick={() => navigate('/patients')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEdit ? 'Update' : 'Register'}
              </Button>
            </FormActions>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
