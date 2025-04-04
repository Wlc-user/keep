import axios from 'axios';
import mockMaterialsService from './mockMaterialsService';

// 检查是否使用模拟数据
// 可以通过环境变量或者localStorage配置
const useMockData = () => {
  return localStorage.getItem('useMockApi') === 'true' || process.env.REACT_APP_USE_MOCK_API === 'true';
};

// 材料API基础路径
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 材料相关API
const materialService = {
  // 获取材料列表
  getMaterials: async (params = {}) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getMaterials(params);
      }
      
      const response = await axios.get(`${BASE_URL}/materials`, { params });
      return response.data;
    } catch (error) {
      console.error('获取材料列表失败:', error);
      
      // 如果真实API失败，尝试使用模拟数据
      if (!useMockData()) {
        console.info('尝试使用模拟数据作为备选');
        return await mockMaterialsService.getMaterials(params);
      }
      
      throw error;
    }
  },
  
  // 获取单个材料详情
  getMaterial: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getMaterial(id);
      }
      
      const response = await axios.get(`${BASE_URL}/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`获取材料ID ${id} 详情失败:`, error);
      
      // 如果真实API失败，尝试使用模拟数据
      if (!useMockData()) {
        return await mockMaterialsService.getMaterial(id);
      }
      
      throw error;
    }
  },
  
  // 创建新材料
  createMaterial: async (materialData) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.createMaterial(materialData);
      }
      
      const response = await axios.post(`${BASE_URL}/materials`, materialData);
      return response.data;
    } catch (error) {
      console.error('创建材料失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.createMaterial(materialData);
      }
      
      throw error;
    }
  },
  
  // 更新材料
  updateMaterial: async (id, materialData) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.updateMaterial(id, materialData);
      }
      
      const response = await axios.put(`${BASE_URL}/materials/${id}`, materialData);
      return response.data;
    } catch (error) {
      console.error(`更新材料ID ${id} 失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.updateMaterial(id, materialData);
      }
      
      throw error;
    }
  },
  
  // 删除材料
  deleteMaterial: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.deleteMaterial(id);
      }
      
      const response = await axios.delete(`${BASE_URL}/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`删除材料ID ${id} 失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.deleteMaterial(id);
      }
      
      throw error;
    }
  },
  
  // 获取材料分类
  getCategories: async () => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getCategories();
      }
      
      const response = await axios.get(`${BASE_URL}/materials/categories`);
      return response.data;
    } catch (error) {
      console.error('获取材料分类失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.getCategories();
      }
      
      throw error;
    }
  },
  
  // 上传材料文件
  uploadMaterial: async (formData) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.uploadMaterial(formData);
      }
      
      const response = await axios.post(`${BASE_URL}/materials/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('上传材料文件失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.uploadMaterial(formData);
      }
      
      throw error;
    }
  },
  
  // 获取热门材料
  getPopularMaterials: async (limit = 5) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getPopularMaterials(limit);
      }
      
      const response = await axios.get(`${BASE_URL}/materials/popular`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('获取热门材料失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.getPopularMaterials(limit);
      }
      
      throw error;
    }
  },
  
  // 获取最新材料
  getRecentMaterials: async (limit = 5) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getRecentMaterials(limit);
      }
      
      const response = await axios.get(`${BASE_URL}/materials/recent`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('获取最新材料失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.getRecentMaterials(limit);
      }
      
      throw error;
    }
  },
  
  // 记录材料查看
  recordMaterialView: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.recordMaterialView(id);
      }
      
      const response = await axios.post(`${BASE_URL}/materials/${id}/view`);
      return response.data;
    } catch (error) {
      console.error(`记录材料ID ${id} 查看失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.recordMaterialView(id);
      }
      
      throw error;
    }
  },
  
  // 记录材料下载
  recordMaterialDownload: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.recordMaterialDownload(id);
      }
      
      const response = await axios.post(`${BASE_URL}/materials/${id}/download`);
      return response.data;
    } catch (error) {
      console.error(`记录材料ID ${id} 下载失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.recordMaterialDownload(id);
      }
      
      throw error;
    }
  },
  
  // 点赞材料
  likeMaterial: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.likeMaterial(id);
      }
      
      const response = await axios.post(`${BASE_URL}/materials/${id}/like`);
      return response.data;
    } catch (error) {
      console.error(`点赞材料ID ${id} 失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.likeMaterial(id);
      }
      
      throw error;
    }
  },
  
  // 取消点赞材料
  unlikeMaterial: async (id) => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.unlikeMaterial(id);
      }
      
      const response = await axios.delete(`${BASE_URL}/materials/${id}/like`);
      return response.data;
    } catch (error) {
      console.error(`取消点赞材料ID ${id} 失败:`, error);
      
      if (!useMockData()) {
        return await mockMaterialsService.unlikeMaterial(id);
      }
      
      throw error;
    }
  },
  
  // 获取教师课程
  getTeacherCourses: async () => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getTeacherCourses();
      }
      
      const response = await axios.get(`${BASE_URL}/teachers/my-courses`);
      return response.data;
    } catch (error) {
      console.error('获取教师课程失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.getTeacherCourses();
      }
      
      throw error;
    }
  },
  
  // 获取学生课程
  getStudentCourses: async () => {
    try {
      if (useMockData()) {
        return await mockMaterialsService.getStudentCourses();
      }
      
      const response = await axios.get(`${BASE_URL}/students/my-courses`);
      return response.data;
    } catch (error) {
      console.error('获取学生课程失败:', error);
      
      if (!useMockData()) {
        return await mockMaterialsService.getStudentCourses();
      }
      
      throw error;
    }
  }
};

export default materialService; 