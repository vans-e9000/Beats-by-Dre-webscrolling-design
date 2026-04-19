import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card, CardBody, Button, Input } from '@/components';
import FormField from '@/components/forms/FormField';
import FormError from '@/components/forms/FormError';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { loginSchema, LoginFormData } from '@/utils/validators';
import { fadeIn } from '@/utils/motion';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Login failed';
      setError('root', { message });
      toast(message, 'error');
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <h2 className={cn('text-xl font-semibold text-secondary-800 mb-6')}>
              Sign In
            </h2>
            <motion.div
              animate={errors.root ? { x: [0, -6, 6, -6, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <FormError error={errors.root?.message} />
            </motion.div>
            <FormField label="Email" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register('email')}
              />
            </FormField>
            <FormField label="Password" error={errors.password?.message} required>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register('password')}
              />
            </FormField>
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Sign In
            </Button>
          </CardBody>
        </form>
      </Card>
    </motion.div>
  );
}
