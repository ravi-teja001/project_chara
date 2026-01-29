// Railway API Service
// This service handles communication with the Railway backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic API client
class RailwayApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Get auth token from localStorage
      const token = localStorage.getItem('supabase_token');
      const headers = {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          message: data.message,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new RailwayApiClient(API_BASE_URL);

// Health check
export const healthCheck = () => apiClient.get<{ status: string; timestamp: string }>('/api/health');

// Stock Points API
export const stockPointsApi = {
  getAll: () => apiClient.get<any[]>('/api/stock-points'),
  getById: (id: string) => apiClient.get<any>(`/api/stock-points/${id}`),
  create: (data: any) => apiClient.post<any>('/api/stock-points', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/stock-points/${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`/api/stock-points/${id}`),
};

// Biomass Procurement API
export const biomassApi = {
  getAll: () => apiClient.get<any[]>('/api/biomass-procurement'),
  getById: (id: string) => apiClient.get<any>(`/api/biomass-procurement/${id}`),
  create: (data: any) => apiClient.post<any>('/api/biomass-procurement', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/biomass-procurement/${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`/api/biomass-procurement/${id}`),
};

// Expenses API
export const expensesApi = {
  getAll: () => apiClient.get<any[]>('/api/expenses'),
  getById: (id: string) => apiClient.get<any>(`/api/expenses/${id}`),
  create: (data: any) => apiClient.post<any>('/api/expenses', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/expenses/${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`/api/expenses/${id}`),
};

// Vehicles API
export const vehiclesApi = {
  getAll: (userId?: string) => 
    apiClient.get<any[]>(userId ? `/api/vehicles?userId=${userId}` : '/api/vehicles'),
  getById: (id: string) => apiClient.get<any>(`/api/vehicles/${id}`),
  create: (data: any, userId: string) => 
    apiClient.post<any>('/api/vehicles', { ...data, userId }),
  update: (id: string, data: any, userId: string) => 
    apiClient.put<any>(`/api/vehicles/${id}`, { ...data, userId }),
  delete: (id: string, userId: string) => 
    apiClient.delete<any>(`/api/vehicles/${id}?userId=${userId}`),
};

// Plants API
export const plantsApi = {
  getAll: () => apiClient.get<any[]>('/api/plants'),
  getById: (id: string) => apiClient.get<any>(`/api/plants/${id}`),
  create: (data: any) => apiClient.post<any>('/api/plants', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/plants/${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`/api/plants/${id}`),
};

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<any>('/api/auth/login', credentials),
  register: (userData: any) =>
    apiClient.post<any>('/api/auth/register', userData),
  logout: () => apiClient.post<any>('/api/auth/logout'),
  refreshToken: () => apiClient.post<any>('/api/auth/refresh'),
  verifyToken: () => apiClient.get<any>('/api/auth/verify'),
};

// File Upload API
export const uploadApi = {
  uploadImage: (file: File, type: 'vehicle' | 'weight' | 'moisture' | 'receipt') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiClient.post<{ url: string }>('/api/upload', formData);
  },
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => apiClient.get<any>('/api/analytics/dashboard'),
  getProcurementStats: (dateRange?: { start: string; end: string }) =>
    apiClient.get<any>(`/api/analytics/procurement${dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : ''}`),
  getExpenseStats: (dateRange?: { start: string; end: string }) =>
    apiClient.get<any>(`/api/analytics/expenses${dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : ''}`),
  getVehicleStats: () => apiClient.get<any>('/api/analytics/vehicles'),
};

export default apiClient;
