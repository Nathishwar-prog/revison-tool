const API_URL = '/api';

export class ApiAdapter {
    private static async getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private static async handleResponse(response: Response) {
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                window.location.href = '/auth/login';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static async get(path: string) {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                method: 'GET',
                headers: await this.getHeaders(),
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.warn(`Backend error on GET ${path}:`, error);
            throw error;
        }
    }

    static async post(path: string, data: any) {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.warn(`Backend error on POST ${path}:`, error);
            throw error;
        }
    }

    static async put(path: string, data: any) {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.warn(`Backend error on PUT ${path}:`, error);
            throw error;
        }
    }

    static async delete(path: string) {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                method: 'DELETE',
                headers: await this.getHeaders(),
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.warn(`Backend error on DELETE ${path}:`, error);
            throw error;
        }
    }
}
