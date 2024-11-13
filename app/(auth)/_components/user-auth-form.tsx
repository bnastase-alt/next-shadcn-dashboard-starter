'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';

const signInSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
});

const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Enter a valid email address' }),
    firstName: z
      .string()
      .min(3, { message: 'First name must be at least 3 characters' }),
    lastName: z
      .string()
      .min(3, { message: 'Last name must be at least 3 characters' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type UserFormValue =
  | z.infer<typeof signInSchema>
  | z.infer<typeof signUpSchema>;

interface UserAuthFormProps {
  onToggle?: (isSignUp: boolean) => void;
}

// 1. Extract authentication handlers
const useAuthHandlers = (
  form: UseFormReturn<UserFormValue>,
  router: ReturnType<typeof useRouter>
) => {
  const handleSignIn = async (data: UserFormValue) => {
    console.log('🔵 Attempting sign in with:', { email: data.email });
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (signInError) {
      console.log('🔴 SignIn Error:', signInError);

      if (signInError.status === 429) {
        toast.error(
          'Too many login attempts. Please wait a few minutes before trying again.'
        );
      } else if (signInError.message === 'Invalid login credentials') {
        toast.error(
          'Invalid email or password. Please try again or create an account.'
        );
      } else {
        toast.error(signInError.message);
      }
      throw signInError;
    }

    console.log('✅ Sign in successful');
    toast.success('Successfully logged in');
    router.push('/dashboard');
  };

  // Add type guard to check if it's a signup form data
  type SignUpFormValue = z.infer<typeof signUpSchema>;
  const isSignUpFormValue = (data: UserFormValue): data is SignUpFormValue => {
    return 'firstName' in data;
  };

  const handleSignUp = async (data: UserFormValue) => {
    if (!isSignUpFormValue(data)) return;

    console.log('🔵 Attempting sign up with:', { email: data.email });
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName
        }
      }
    });

    if (signUpError) {
      console.log('🔴 SignUp Error:', signUpError);
      if (signUpError.message === 'User already registered') {
        toast.error(
          'You already have an account. Please try resetting your password.'
        );
      } else {
        toast.error(signUpError.message);
      }
      throw signUpError;
    }

    console.log('✅ Sign up successful');
    toast.success('Account created successfully!');
    router.push('/dashboard');
  };

  return { handleSignIn, handleSignUp };
};

// 2. Extract form validation logic
const useFormValidation = (
  form: UseFormReturn<UserFormValue>,
  isSignUp: boolean
) => {
  const { email, password } = form.watch();
  console.log('🔵 Form values changed:', { email, password, isSignUp });

  const isValidEmail = (email: string) => {
    return email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const isFormComplete =
    !isSignUp && isValidEmail(email || '') && password?.length > 0;
  console.log('Form complete status:', isFormComplete);

  return { isFormComplete };
};

// 3. Main component with cleaner structure
export default function UserAuthForm({ onToggle }: UserAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, startTransition] = useTransition();
  const [isSignUp, setIsSignUp] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    }
  });

  const { handleSignIn, handleSignUp } = useAuthHandlers(form, router);
  const { isFormComplete } = useFormValidation(form, isSignUp);

  const onSubmit = async (data: UserFormValue) => {
    console.log('🔵 Form submitted with:', data);
    startTransition(async () => {
      try {
        const token = recaptchaRef.current?.getValue();
        console.log('🔵 Captcha token:', token);

        if (!token) {
          toast.error('Please complete the captcha');
          return;
        }

        const verifyResponse = await fetch('/api/verify-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const verifyData = await verifyResponse.json();
        console.log('🔵 Verify response:', verifyData);

        if (!verifyResponse.ok) {
          toast.error(`Captcha verification failed: ${verifyData.error}`);
          recaptchaRef.current?.reset();
          return;
        }

        console.log('🔵 Starting validation...');
        // Log current form errors before validation
        console.log('Current form state:', form.formState);

        const result = await form.trigger();

        // Log validation details
        console.log('Validation result:', result);
        console.log('Form errors:', form.formState.errors);

        if (!result) {
          console.log(
            '🔴 Form validation failed. Errors:',
            form.formState.errors
          );
          return;
        }

        if (isSignUp) {
          await handleSignUp(data);
        } else {
          await handleSignIn(data);
        }
      } catch (err) {
        console.error('🔴 [Auth Form] Error:', err);
        recaptchaRef.current?.reset();
      }
    });
  };

  const handleToggle = () => {
    const currentEmail = form.getValues('email');
    form.reset({
      email: currentEmail,
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
    setIsSignUp(!isSignUp);
    onToggle?.(!isSignUp);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form.getValues());
        }}
        className="w-full space-y-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isSignUp && (
          <>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isSignUp && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="my-4 flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            theme="dark"
            className="scale-90 transform"
          />
        </div>

        <Button
          disabled={loading || (!isSignUp && !isFormComplete)}
          className="ml-auto w-full"
          type="submit"
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={handleToggle}
            className="text-muted-foreground hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </form>
    </Form>
  );
}
