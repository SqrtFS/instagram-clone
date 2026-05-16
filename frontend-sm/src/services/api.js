import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000/v1'
  : 'https://instagram-clone-production-50cc.up.railway.app/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (token) => {
    const response = await api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateUser: async (username, userData, token) => {
    const response = await api.put(`/auth/${username}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('access_token');
  },
};

export const postsAPI = {
  create: async (postData, token) => {
    const response = await api.post('/posts/', postData, {
      params: { token },
    });
    return response.data;
  },

  getById: async (postId, token = null) => {
    const params = token ? { token } : {};
    const response = await api.get(`/posts/${postId}`, { params });
    return response.data;
  },

  getFeed: async (page = 1, limit = 5, hashtag = null, token = null) => {
    const params = { page, limit };
    if (hashtag) params.hashtag = hashtag;
    if (token) params.token = token;
    const response = await api.get('/posts/dashboard', { params });
    return response.data;
  },

  getByHashtag: async (hashtag, token = null) => {
    const params = token ? { token } : {};
    const response = await api.get(`/posts/hashtag/${hashtag}`, { params });
    return response.data;
  },

  getUserPosts: async (username) => {
    const response = await api.get(`/posts/user/${username}`);
    return response.data;
  },

  getCurrentUserPosts: async (token) => {
    const response = await api.get('/posts/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (postId, token) => {
    const response = await api.delete('/posts/', {
      params: { post_id: postId, token },
    });
    return response.data;
  },

  like: async (postId, username) => {
    const response = await api.post('/posts/like', null, {
      params: { post_id: postId, username },
    });
    return response.data;
  },

  unlike: async (postId, username) => {
    const response = await api.post('/posts/unlike', null, {
      params: { post_id: postId, username },
    });
    return response.data;
  },

  getLikedUsers: async (postId) => {
    const response = await api.get(`/posts/likes/${postId}`);
    return response.data;
  },
};

export const profileAPI = {
  getProfile: async (username) => {
    const response = await api.get(`/profile/user/${username}`);
    return response.data;
  },

  follow: async (username, token) => {
    const response = await api.post(`/profile/follow/${username}`, null, {
      params: { token },
    });
    return response.data;
  },

  unfollow: async (username, token) => {
    const response = await api.post(`/profile/unfollow/${username}`, null, {
      params: { token },
    });
    return response.data;
  },

  getFollowers: async (token) => {
    const response = await api.get('/profile/followers', {
      params: { token },
    });
    return response.data;
  },

  getFollowing: async (token) => {
    const response = await api.get('/profile/following', {
      params: { token },
    });
    return response.data;
  },

  block: async (username, token) => {
    const response = await api.post(`/profile/block/${username}`, null, {
      params: { token },
    });
    return response.data;
  },

  unblock: async (username, token) => {
    const response = await api.post(`/profile/unblock/${username}`, null, {
      params: { token },
    });
    return response.data;
  },
};

export const activityAPI = {
  getActivity: async (username, page = 1, limit = 10) => {
    const response = await api.get(`/activity/user/${username}`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default api;
