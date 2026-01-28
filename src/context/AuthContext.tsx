"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useRouter } from 'next/navigation';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const data = await api.getMe();
                    if (data?.user) {
                        setUser(data.user);
                    } else {
                        // Invalid token
                        localStorage.removeItem('auth_token');
                        setUser(null);
                    }
                }
            } catch (e) {
                console.error("Auth init failed", e);
                localStorage.removeItem('auth_token');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (credentials: any) => {
        const data = await api.login(credentials);
        setUser(data.user);
        router.push('/');
    };

    const register = async (userData: any) => {
        const data = await api.register(userData);
        setUser(data.user);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
