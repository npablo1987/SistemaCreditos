import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { LoginRequest, TokenResponse } from '@/models/auth.model';
import { User } from '@/models/user.model';

const AUTH_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth`;

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${AUTH_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await axios.post(`${AUTH_URL}/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
