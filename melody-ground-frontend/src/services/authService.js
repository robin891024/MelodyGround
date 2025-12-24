import api from './api';

export const authService = {
  // 使用者註冊
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  // 使用者登入
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 取得當前使用者
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 檢查是否已登入
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
