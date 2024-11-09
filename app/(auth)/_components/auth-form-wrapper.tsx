'use client';

import { useState } from 'react';
import UserAuthForm from './user-auth-form';

export default function AuthFormWrapper() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? 'Enter your email below to create your account'
            : 'Sign in to your account'}
        </p>
      </div>
      <UserAuthForm onToggle={setIsSignUp} />
    </div>
  );
}
