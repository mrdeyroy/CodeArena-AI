'use client';

import * as React from 'react';
import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center w-full py-4">
      <SignUp
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#4f46e5', // Tailwind indigo-600
            colorBackground: '#0f172a', // Tailwind slate-900
            colorText: '#f8fafc', // Tailwind slate-50
            colorTextSecondary: '#94a3b8', // Tailwind slate-400
            colorInputBackground: '#020617', // Tailwind slate-950
            colorInputText: '#f8fafc',
            colorBorder: '#1e293b', // Tailwind slate-800
          }
        }}
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
