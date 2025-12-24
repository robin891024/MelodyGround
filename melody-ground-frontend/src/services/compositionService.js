import api from './api';

export const compositionService = {
  // 取得所有作品
  getAllCompositions: async () => {
    const response = await api.get('/compositions');
    return response.data;
  },

  // 取得單一作品
  getComposition: async (id) => {
    const response = await api.get(`/compositions/${id}`);
    return response.data;
  },

  // 建立作品
  createComposition: async (compositionData) => {
    const response = await api.post('/compositions', compositionData);
    return response.data;
  },

  // 更新作品
  updateComposition: async (id, compositionData) => {
    const response = await api.put(`/compositions/${id}`, compositionData);
    return response.data;
  },

  // 刪除作品
  deleteComposition: async (id) => {
    await api.delete(`/compositions/${id}`);
  },

  // 匯出 MIDI
  exportMidi: async (id) => {
    const response = await api.get(`/compositions/${id}/export/midi`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
