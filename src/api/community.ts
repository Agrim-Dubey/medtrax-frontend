import api from './axios';

export const communityAPI = {
  getCategories: () => api.get('/api/community/categories/'),
  getPosts: (category?: string) => api.get(`/api/community/posts/${category ? `?category=${category}` : ''}`),
  createPost: (data: FormData) => api.post('/api/community/posts/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPostDetail: (slug: string) => api.get(`/api/community/posts/${slug}/`),
  deletePost: (slug: string) => api.delete(`/api/community/posts/${slug}/`),
  likePost: (slug: string) => api.post(`/api/community/posts/${slug}/like/`),
  getComments: (slug: string) => api.get(`/api/community/posts/${slug}/comments/`),
  createComment: (slug: string, data: { content: string; parent?: number }) => api.post(`/api/community/posts/${slug}/comments/create/`, data),
  getMyPosts: () => api.get('/api/community/posts/my-posts/'),
};
