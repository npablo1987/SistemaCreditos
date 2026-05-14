import axiosInstance from '@/core/http/axios.instance';
import { User, UserCreate, UserUpdate, ChangePassword } from '@/models/user.model';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: UserCreate): Promise<User> => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  changePassword: async (data: ChangePassword): Promise<void> => {
    await axiosInstance.post('/users/me/change-password', data);
  },
};
