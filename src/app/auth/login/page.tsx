"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, KeyRound, HelpCircle } from 'lucide-react';
import { AuthLayout, FormField, UserAvatar, ActionButton, LoadingSpinner } from '@/components/ui/AuthComponents';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const displayName = email ? email.split('@')[0] : 'User';

    return (
        <AuthLayout>
            <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
                {/* Main login content - centered */}
                <div className="flex flex-col items-center">
                    {/* Avatar with animation */}
                    <div className="animate-in zoom-in-75 duration-500">
                        <UserAvatar name={displayName} size={96} />
                    </div>

                    {/* Username display */}
                    <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                        <h1 className="text-xl font-medium text-white drop-shadow-lg">
                            {displayName}
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-6 w-72 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
                        {/* Error message */}
                        {error && (
                            <div className="mb-4 text-center animate-in fade-in duration-200">
                                <p className="text-sm text-red-300 drop-shadow-md">{error}</p>
                            </div>
                        )}

                        {/* Email field - only show if empty */}
                        {!showPassword && (
                            <div className="space-y-3">
                                <FormField
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => email && setShowPassword(true)}
                                    disabled={!email}
                                    className="w-full py-2.5 text-white/70 hover:text-white text-sm transition-colors duration-200 disabled:opacity-40"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Password field */}
                        {showPassword && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    isPassword
                                    autoComplete="current-password"
                                    autoFocus
                                />
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(false)}
                                        className="text-white/50 hover:text-white text-xs transition-colors duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !password}
                                        className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                        style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}
                                    >
                                        {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Switch user link */}
                    <Link 
                        href="/auth/register" 
                        className="mt-6 text-white/60 hover:text-white text-sm transition-colors duration-200 animate-in fade-in duration-500 delay-300"
                    >
                        Create New Account
                    </Link>
                </div>

                {/* Bottom action buttons */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <ActionButton icon={UserPlus} onClick={() => router.push('/auth/register')}>
                        Sign Up
                    </ActionButton>
                    <ActionButton icon={KeyRound} onClick={() => alert('Password reset link will be sent to your email')}>
                        Forgot Password
                    </ActionButton>
                    <ActionButton icon={HelpCircle} onClick={() => window.open('mailto:support@knowgrow.com', '_blank')}>
                        Help
                    </ActionButton>
                </div>
            </div>
        </AuthLayout>
    );
}
