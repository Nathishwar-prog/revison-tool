import { ApiAdapter } from './api.adapter';

export const AuthAdapter = {
    async login(credentials: any) {
        const data = await ApiAdapter.post('/auth/login', credentials);
        if (data.token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
        }
        return data;
    },

    async register(userData: any) {
        const data = await ApiAdapter.post('/auth/register', userData);
        if (data.token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
        }
        return data;
    },

    async me() {
        if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
            return null;
        }
        try {
            return await ApiAdapter.get('/auth/me');
        } catch (e) {
            return null;
        }
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
        }
    }
};
