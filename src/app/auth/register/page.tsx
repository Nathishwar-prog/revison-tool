"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, HelpCircle, Shield } from 'lucide-react';
import { AuthLayout, FormField, UserAvatar, ActionButton, LoadingSpinner } from '@/components/ui/AuthComponents';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setError('');
        try {
            await register({ name, email, password });
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const displayName = name || 'New User';

    const nextStep = () => {
        if (step === 1 && name) setStep(2);
        else if (step === 2 && email) setStep(3);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <AuthLayout>
            <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
                {/* Main content - centered */}
                <div className="flex flex-col items-center">
                    {/* Avatar with animation */}
                    <div className="animate-in zoom-in-75 duration-500">
                        <UserAvatar name={displayName} size={96} />
                    </div>

                    {/* Title */}
                    <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                        <h1 className="text-xl font-medium text-white drop-shadow-lg">
                            {step === 1 ? 'Create Account' : displayName}
                        </h1>
                        <p className="mt-1 text-sm text-white/60">
                            {step === 1 ? 'Enter your name' : step === 2 ? 'Enter your email' : 'Create a password'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 w-72 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
                        {/* Error message */}
                        {error && (
                            <div className="mb-4 text-center animate-in fade-in duration-200">
                                <p className="text-sm text-red-300 drop-shadow-md">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Name */}
                        {step === 1 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!name}
                                    className="w-full py-2.5 text-white/70 hover:text-white text-sm transition-colors duration-200 disabled:opacity-40"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Email */}
                        {step === 2 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="text-white/50 hover:text-white text-xs transition-colors duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!email}
                                        className="px-6 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                        style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Password */}
                        {step === 3 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    type="password"
                                    placeholder="Create Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    isPassword
                                    autoComplete="new-password"
                                    autoFocus
                                />
                                {password && (
                                    <div className="flex items-center justify-center gap-2 animate-in fade-in duration-200">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`w-8 h-1 rounded-full transition-all duration-300 ${
                                                        password.length >= i * 3
                                                            ? password.length >= 8 ? 'bg-green-400' : 'bg-amber-400'
                                                            : 'bg-white/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-4 pt-1">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="text-white/50 hover:text-white text-xs transition-colors duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !password || password.length < 6}
                                        className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                        style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}
                                    >
                                        {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Sign in link */}
                    <Link 
                        href="/auth/login" 
                        className="mt-6 text-white/60 hover:text-white text-sm transition-colors duration-200 animate-in fade-in duration-500 delay-300"
                    >
                        Already have an account? Sign In
                    </Link>
                </div>

                {/* Bottom action buttons */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <ActionButton icon={LogIn} onClick={() => router.push('/auth/login')}>
                        Sign In
                    </ActionButton>
                    <ActionButton icon={Shield} onClick={() => alert('Your data is encrypted and secure. We never share your information.')}>
                        Privacy
                    </ActionButton>
                    <ActionButton icon={HelpCircle} onClick={() => window.open('mailto:support@knowgrow.com', '_blank')}>
                        Help
                    </ActionButton>
                </div>
            </div>
        </AuthLayout>
    );
}
