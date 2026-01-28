"use client";

import React from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const LoadingSpinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-8 w-8"
    };
    return (
        <Loader2 className={`animate-spin text-current ${sizeClasses[size]} ${className}`} />
    );
};

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
            {/* macOS-style scenic background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
                }}
            />
            {/* Subtle dark overlay for readability */}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Content */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
                {children}
            </div>
        </div>
    );
};

export const UserAvatar = ({ name, size = 96 }: { name?: string, size?: number }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="relative group">
            {/* Outer ring */}
            <div 
                className="absolute -inset-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Avatar container - macOS style */}
            <div 
                className="relative rounded-full bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center text-white font-normal overflow-hidden transition-transform duration-300 group-hover:scale-105"
                style={{ 
                    width: size, 
                    height: size, 
                    fontSize: size * 0.4,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Inner highlight */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" style={{ height: '50%' }} />
                <span className="relative z-10 drop-shadow-sm">{initial}</span>
            </div>
        </div>
    );
};

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ElementType;
    error?: string;
    isPassword?: boolean;
}

export const FormField = ({ label, icon: Icon, error, isPassword, className = "", ...props }: FormFieldProps) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type || 'text';

    return (
        <div className="w-full">
            <div className="relative">
                <input
                    {...props}
                    type={inputType}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={`
                        block w-full rounded-full
                        bg-white/20 backdrop-blur-xl
                        border border-white/30
                        px-5 py-3
                        text-white text-sm text-center font-light
                        placeholder-white/50
                        transition-all duration-300 ease-out
                        focus:bg-white/30 focus:border-white/50 focus:outline-none focus:ring-0
                        hover:bg-white/25
                        ${error ? 'border-red-400/50' : ''}
                        ${className}
                    `}
                    style={{
                        boxShadow: isFocused 
                            ? '0 0 0 4px rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.2)' 
                            : '0 4px 20px rgba(0, 0, 0, 0.2)'
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-200"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-300 text-center animate-in fade-in duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};

export const AuthButton = ({ children, loading, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => {
    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            className={`
                relative flex items-center justify-center rounded-full
                bg-white/20 backdrop-blur-xl
                border border-white/30
                px-8 py-3 min-w-[120px]
                text-sm font-medium text-white
                transition-all duration-300 ease-out
                hover:bg-white/30 hover:border-white/50 hover:scale-105
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${className}
            `}
            style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
        >
            {loading ? (
                <LoadingSpinner size="sm" />
            ) : (
                children
            )}
        </button>
    );
};

export const ActionButton = ({ 
    children, 
    icon: Icon, 
    onClick,
    active = false 
}: { 
    children: React.ReactNode, 
    icon: React.ElementType, 
    onClick?: () => void,
    active?: boolean 
}) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 hover:bg-white/10 group"
        >
            <div 
                className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/25 group-hover:scale-110"
                style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}
            >
                <Icon className="h-6 w-6 text-white/90" />
            </div>
            <span className="text-xs text-white/80 font-medium">{children}</span>
        </button>
    );
};

export const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`relative ${className}`}>
            {children}
        </div>
    );
};

export const Divider = ({ text }: { text?: string }) => {
    return (
        <div className="relative flex items-center py-4">
            <div className="flex-1 h-px bg-white/20" />
            {text && (
                <span className="px-4 text-xs text-white/50 font-medium">
                    {text}
                </span>
            )}
            <div className="flex-1 h-px bg-white/20" />
        </div>
    );
};
