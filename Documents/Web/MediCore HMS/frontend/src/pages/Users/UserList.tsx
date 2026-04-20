import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usersService, CreateUserData, UpdateUserData } from '@/services/users';
import { USER_ROLES } from '@/utils/constants';
import { User } from '@/types';
import { registerSchema, RegisterFormData } from '@/utils/validators';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { pageEnter } from '@/utils/motion';
import { Card, CardBody, Button, Badge, Modal, Input, Select, TableSkeleton } from '@/components';
import Table from '@/components/common/Table';
import FormField from '@/components/forms/FormField';
import FormActions from '@/components/forms/FormActions';
import FormError from '@/components/forms/FormError';
import { useToast } from '@/store/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

const roleOptions = Object.entries(USER_ROLES).map(([value, label]) => ({
  value,
  label,
}));

export default function UserList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      toast('User created successfully');
    },
    onError: () => {
      toast('Failed to create user', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      toast('User updated successfully');
    },
    onError: () => {
      toast('Failed to update user', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast('User deleted successfully');
    },
    onError: () => {
      toast('Failed to delete user', 'error');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (formData: RegisterFormData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser, data: formData });
    } else {
      createMutation.mutate(formData as CreateUserData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    reset({ name: user.name, email: user.email, role: user.role as RegisterFormData['role'], password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(user.id);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => <Badge variant="info">{USER_ROLES[row.role as keyof typeof USER_ROLES]}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: User) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className={cn('p-1 text-primary-600 hover:bg-primary-50 rounded')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className={cn('p-1 text-danger-600 hover:bg-danger-50 rounded')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-800">Users</h1>
        <Card>
          <CardBody className="p-0">
            <TableSkeleton />
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageEnter} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-800">Users</h1>
        <Button onClick={() => { setEditingUser(null); reset(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table<User> columns={columns} data={(data?.data || []) as User[]} keyField="id" />
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} title={editingUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <FormError />
            <FormField label="Name" error={errors.name?.message} required>
              <Input placeholder="Enter name" {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message} required>
              <Input type="email" placeholder="Enter email" {...register('email')} />
            </FormField>
            <FormField label="Role" error={errors.role?.message} required>
              <Select options={roleOptions} {...register('role')} />
            </FormField>
            {!editingUser && (
              <FormField label="Password" error={errors.password?.message} required>
                <Input type="password" placeholder="Enter password" {...register('password')} />
              </FormField>
            )}
            {!editingUser && (
              <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
                <Input type="password" placeholder="Confirm password" {...register('confirmPassword')} />
              </FormField>
            )}
          </CardBody>
          <CardBody className="border-t">
            <FormActions>
              <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </FormActions>
          </CardBody>
        </form>
      </Modal>
    </motion.div>
  );
}
