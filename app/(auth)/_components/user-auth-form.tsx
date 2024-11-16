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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
    try {
      console.log('🔵 [SignIn] Starting with:', { email: data.email });

      // 1. Authenticate user
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password
        });

      if (signInError) {
        console.error('🔴 [SignIn] Error:', signInError);
        toast.error(signInError.message);
        return;
      }

      if (authData?.user) {
        console.log('✅ [SignIn] Auth successful, checking user type');

        // 2. Get user's type from profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('🔴 [SignIn] Profile fetch error:', profileError);
          toast.error('Failed to fetch user profile');
          return;
        }

        console.log('✅ [SignIn] User type found:', profile.user_type);
        toast.success('Successfully logged in');

        // Updated routing logic
        if (
          profile.user_type === 'admin' ||
          profile.user_type === 'recruiter'
        ) {
          router.push('/dashboard/overview');
        } else {
          router.push('/applicant');
        }
      }
    } catch (error) {
      console.error('🔴 [SignIn] Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
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
  const skipCaptcha = process.env.NEXT_PUBLIC_SKIP_CAPTCHA === 'true';
  console.log(
    '🔵 Skip Captcha:',
    skipCaptcha,
    process.env.NEXT_PUBLIC_SKIP_CAPTCHA
  );

  const form = useForm<UserFormValue>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || '',
      password: process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || '',
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
        console.log('🔵 Skip Captcha Status:', skipCaptcha);

        // Only verify captcha if not skipped
        if (!skipCaptcha) {
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
        } else {
          console.log('🔵 Captcha verification skipped');
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

  // Add this function for direct navigation
  const handleDevBypass = async () => {
    console.log('🔵 [DevBypass] Starting authentication...');
    try {
      // Create a new supabase client for this request
      const supabase = createClientComponentClient();

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL!,
          password: process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD!
        });

      console.log('🔵 [DevBypass] Auth attempt result:', {
        success: !!authData?.session,
        error: signInError?.message || 'none',
        user: authData?.user?.id || 'none'
      });

      if (signInError) {
        console.error('🔴 [DevBypass] Auth error:', signInError);
        toast.error('Authentication failed');
        return;
      }

      if (authData?.session) {
        console.log(
          '✅ [DevBypass] Session created:',
          authData.session.access_token
        );
        toast.success('Authenticated successfully');
        router.push('/dashboard/overview');
      } else {
        console.log('🔴 [DevBypass] No session created');
        toast.error('No session created');
      }
    } catch (error) {
      console.error('🔴 [DevBypass] Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="grid gap-6">
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

      {/* Add development bypass button */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          type="button"
          variant="outline"
          onClick={handleDevBypass}
          className="bg-yellow-500/10 hover:bg-yellow-500/20"
        >
          [DEV] Skip to Dashboard
        </Button>
      )}

      <div className="text-xs text-muted-foreground">
        Skip Captcha: {String(skipCaptcha)}
      </div>

      {!skipCaptcha && (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
          theme="dark"
          className="scale-90 transform"
        />
      )}
    </div>
  );
}
