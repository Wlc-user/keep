import axios from 'axios';
import { message } from 'antd';
import config from '../config/env';
import {
  Material,
  MaterialCategory,
  MaterialListResponse,
  MaterialQueryParams,
  MaterialUploadParams
} from '../types/material';
import { getMockMaterials, getMockMaterial, getMockCategories } from './mockData';
import moment from 'moment';
import mockService from './mockService';
import apiService from './apiService';
import mockDataLoader from '../utils/mockDataLoader';

const API_URL = config.API_BASE_URL;
const USE_MOCK = config.USE_MOCK_DATA;

// 缓存管理
const cache = {
  materials: new Map<string, Material>(),
  categories: new Map<string, MaterialCategory>(),
  materialLists: new Map<string, MaterialListResponse>(),
  permissions: new Map<string, string[]>(),
  
  // 设置缓存
  set: (key: string, value: any, type: 'material' | 'category' | 'materialList' | 'permission') => {
    switch (type) {
      case 'material':
        cache.materials.set(key, value);
        break;
      case 'category':
        cache.categories.set(key, value);
        break;
      case 'materialList':
        cache.materialLists.set(key, value);
        break;
      case 'permission':
        cache.permissions.set(key, value);
        break;
    }
  },
  
  // 获取缓存
  get: (key: string, type: 'material' | 'category' | 'materialList' | 'permission') => {
    switch (type) {
      case 'material':
        return cache.materials.get(key);
      case 'category':
        return cache.categories.get(key);
      case 'materialList':
        return cache.materialLists.get(key);
      case 'permission':
        return cache.permissions.get(key);
      default:
        return null;
    }
  },
  
  // 清除缓存
  clear: (type?: 'material' | 'category' | 'materialList' | 'permission') => {
    if (!type) {
      cache.materials.clear();
      cache.categories.clear();
      cache.materialLists.clear();
      cache.permissions.clear();
      return;
    }
    
    switch (type) {
      case 'material':
        cache.materials.clear();
        break;
      case 'category':
        cache.categories.clear();
        break;
      case 'materialList':
        cache.materialLists.clear();
        break;
      case 'permission':
        cache.permissions.clear();
        break;
    }
  },
  
  // 移除特定缓存
  remove: (key: string, type: 'material' | 'category' | 'materialList' | 'permission') => {
    switch (type) {
      case 'material':
        cache.materials.delete(key);
        break;
      case 'category':
        cache.categories.delete(key);
        break;
      case 'materialList':
        cache.materialLists.delete(key);
        break;
      case 'permission':
        cache.permissions.delete(key);
        break;
    }
  }
};

// 生成缓存键
const generateCacheKey = (params: any): string => {
  return JSON.stringify(params);
};

// 获取素材列表
export const getMaterials = async (params?: MaterialQueryParams): Promise<MaterialListResponse> => {
  const cacheKey = generateCacheKey(params);
  const cachedData = cache.get(cacheKey, 'materialList');
  
  if (cachedData) {
    console.log('从缓存获取素材列表');
    return cachedData as MaterialListResponse;
  }
  
  if (USE_MOCK) {
    return Promise.resolve(getMockMaterials(params));
  }

  try {
    const response = await apiService.get('/api/materials', params);
    
    // 添加到缓存
    cache.set(cacheKey, response, 'materialList');
    
    return response.data;
  } catch (error) {
    console.error('获取素材列表失败:', error);
    // 在开发模式下使用模拟数据
    if (process.env.NODE_ENV === 'development') {
      return getMockMaterials(params);
    }
    throw error;
  }
};

// 获取素材详情
export const getMaterial = async (id: string): Promise<Material> => {
  const cachedData = cache.get(id, 'material');
  
  if (cachedData) {
    console.log('从缓存获取素材详情');
    return cachedData as Material;
  }

  if (USE_MOCK) {
    const material = getMockMaterial(id);
    if (!material) {
      throw new Error('素材不存在');
    }
    // 添加到缓存
    cache.set(id, material, 'material');
    return Promise.resolve(material);
  }

  try {
    const response = await apiService.get(`/api/materials/${id}`);
    
    // 添加到缓存
    cache.set(id, response.data, 'material');
    
    return response.data;
  } catch (error) {
    console.error('获取素材详情失败:', error);
    const material = getMockMaterial(id);
    if (!material) {
      throw new Error('素材不存在');
    }
    message.error('获取素材详情失败，使用模拟数据');
    // 添加到缓存
    cache.set(id, material, 'material');
    return material;
  }
};

// 上传素材
export const uploadMaterial = async (params: MaterialUploadParams): Promise<Material> => {
  if (USE_MOCK) {
    // 模拟上传成功
    const newId = (Math.floor(Math.random() * 10000) + 1).toString();
    const mockMaterial: Material = {
      id: newId,
      title: params.title,
      description: params.description,
      url: URL.createObjectURL(params.file),
      type: params.type,
      status: 'pending' as any,
      categoryId: params.categoryId,
      categoryName: '未知分类', // 模拟数据中没有实际查询分类
      uploaderId: 'current-user',
      uploaderName: '当前用户',
      tags: params.tags || [],
      size: params.file.size,
      downloadCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    message.success('素材上传成功（模拟）');
    return Promise.resolve(mockMaterial);
  }

  try {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('title', params.title);
    formData.append('description', params.description);
    formData.append('type', params.type);
    formData.append('categoryId', params.categoryId);
    if (params.tags) {
      formData.append('tags', JSON.stringify(params.tags));
    }

    const response = await apiService.post('/api/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传素材失败:', error);
    message.error('上传素材失败');
    throw error;
  }
};

// 更新素材
export const updateMaterial = async (id: string, data: Partial<Material>): Promise<Material> => {
  if (USE_MOCK) {
    // 模拟更新成功
    const material = getMockMaterial(id);
    if (!material) {
      throw new Error('素材不存在');
    }
    
    const updatedMaterial = {
      ...material,
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    message.success('素材更新成功（模拟）');
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
    return Promise.resolve(updatedMaterial);
  }

  try {
    const response = await apiService.put(`/api/materials/${id}`, data);
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
    return response.data;
  } catch (error) {
    console.error('更新素材失败:', error);
    message.error('更新素材失败');
    throw error;
  }
};

// 删除素材
export const deleteMaterial = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    // 模拟删除成功
    message.success('素材删除成功（模拟）');
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
    return Promise.resolve();
  }

  try {
    await apiService.delete(`/api/materials/${id}`);
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
  } catch (error) {
    console.error('删除素材失败:', error);
    message.error('删除素材失败');
    throw error;
  }
};

// 审核素材
export const approveMaterial = async (id: string, approved: boolean, comment?: string): Promise<Material> => {
  if (USE_MOCK) {
    // 模拟审核成功
    const material = getMockMaterial(id);
    if (!material) {
      throw new Error('素材不存在');
    }
    
    const updatedMaterial = {
      ...material,
      status: approved ? 'approved' : 'rejected',
      rejectReason: !approved ? comment : undefined,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    message.success(`素材${approved ? '审核通过' : '拒绝'}成功（模拟）`);
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
    return Promise.resolve(updatedMaterial as Material);
  }

  try {
    const response = await apiService.post(`/api/materials/${id}/approve`, {
      approved,
      comment,
    });
    // 清除相关缓存
    cache.remove(id, 'material');
    cache.clear('materialList');
    return response.data;
  } catch (error) {
    console.error('审核素材失败:', error);
    message.error('审核素材失败');
    throw error;
  }
};

// 获取素材分类列表
export const getCategories = async (): Promise<MaterialCategory[]> => {
  const cacheKey = 'all-categories';
  const cachedData = cache.get(cacheKey, 'category');
  
  if (cachedData) {
    console.log('从缓存获取分类列表');
    return cachedData as MaterialCategory[];
  }
  
  if (USE_MOCK) {
    return Promise.resolve(getMockCategories());
  }

  try {
    const response = await apiService.get('/api/materials/categories');
    
    // 添加到缓存
    cache.set(cacheKey, response.data, 'category');
    
    return response.data;
  } catch (error) {
    console.error('获取素材分类列表失败:', error);
    if (process.env.NODE_ENV === 'development') {
      return getMockCategories();
    }
    throw error;
  }
};

// 创建素材分类
export const createCategory = async (data: Omit<MaterialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaterialCategory> => {
  if (USE_MOCK) {
    // 模拟创建成功
    const newId = (Math.floor(Math.random() * 10000) + 1).toString();
    const mockCategory: MaterialCategory = {
      id: newId,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    message.success('分类创建成功（模拟）');
    return Promise.resolve(mockCategory);
  }

  try {
    const response = await apiService.post('/api/materials/categories', data);
    return response.data;
  } catch (error) {
    console.error('创建素材分类失败:', error);
    message.error('创建素材分类失败');
    throw error;
  }
};

// 更新素材分类
export const updateCategory = async (id: string, data: Partial<MaterialCategory>): Promise<MaterialCategory> => {
  if (USE_MOCK) {
    // 模拟更新成功
    const category = getMockCategories().find(c => c.id === id);
    if (!category) {
      throw new Error('分类不存在');
    }
    
    const updatedCategory = {
      ...category,
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    message.success('分类更新成功（模拟）');
    return Promise.resolve(updatedCategory);
  }

  try {
    const response = await apiService.put(`/api/materials/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('更新素材分类失败:', error);
    message.error('更新素材分类失败');
    throw error;
  }
};

// 删除素材分类
export const deleteCategory = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    // 模拟删除成功
    message.success('分类删除成功（模拟）');
    return Promise.resolve();
  }

  try {
    await apiService.delete(`/api/materials/categories/${id}`);
  } catch (error) {
    console.error('删除素材分类失败:', error);
    message.error('删除素材分类失败');
    throw error;
  }
};

// 增强素材查询功能，支持全文检索和模糊查询
export const searchMaterials = async (params: MaterialQueryParams): Promise<MaterialListResponse> => {
  if (USE_MOCK) {
    return Promise.resolve(getMockMaterials(params));
  }

  try {
    const response = await apiService.get('/api/materials/search', { params });
    return response.data;
  } catch (error) {
    console.error('搜索素材失败:', error);
    message.error('搜索素材失败，使用模拟数据');
    return getMockMaterials(params);
  }
};

// 获取素材访问权限
export const getMaterialPermissions = async (materialId: string): Promise<string[]> => {
  if (USE_MOCK) {
    // 模拟权限数据
    return Promise.resolve(['view', 'download', 'edit', 'delete']);
  }

  try {
    const response = await apiService.get(`/api/materials/${materialId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('获取素材权限失败:', error);
    message.error('获取素材权限失败，使用模拟数据');
    return ['view']; // 默认只有查看权限
  }
};

// 更新素材访问权限
export const updateMaterialPermissions = async (
  materialId: string, 
  permissions: {
    roleId: string;
    permissions: string[];
  }[]
): Promise<void> => {
  if (USE_MOCK) {
    // 模拟更新成功
    message.success('素材权限更新成功（模拟）');
    return Promise.resolve();
  }

  try {
    await apiService.put(`/api/materials/${materialId}/permissions`, { permissions });
    message.success('素材权限更新成功');
  } catch (error) {
    console.error('更新素材权限失败:', error);
    message.error('更新素材权限失败');
    throw error;
  }
};

// 获取分类访问权限
export const getCategoryPermissions = async (categoryId: string): Promise<string[]> => {
  if (USE_MOCK) {
    // 模拟权限数据
    return Promise.resolve(['view', 'edit', 'delete']);
  }

  try {
    const response = await apiService.get(`/api/materials/categories/${categoryId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('获取分类权限失败:', error);
    message.error('获取分类权限失败，使用模拟数据');
    return ['view']; // 默认只有查看权限
  }
};

// 更新分类访问权限
export const updateCategoryPermissions = async (
  categoryId: string, 
  permissions: {
    roleId: string;
    permissions: string[];
  }[]
): Promise<void> => {
  if (USE_MOCK) {
    // 模拟更新成功
    message.success('分类权限更新成功（模拟）');
    return Promise.resolve();
  }

  try {
    await apiService.put(`/api/materials/categories/${categoryId}/permissions`, { permissions });
    message.success('分类权限更新成功');
  } catch (error) {
    console.error('更新分类权限失败:', error);
    message.error('更新分类权限失败');
    throw error;
  }
};

// 检查用户是否有权限访问素材
export const checkMaterialAccess = async (materialId: string, permission: string): Promise<boolean> => {
  const cacheKey = `${materialId}-${permission}`;
  const cachedData = cache.get(cacheKey, 'permission');
  
  if (cachedData !== undefined) {
    console.log('从缓存获取权限检查结果');
    return cachedData as boolean;
  }

  if (USE_MOCK) {
    // 模拟权限检查，在模拟环境中总是返回true
    return Promise.resolve(true);
  }

  try {
    const response = await apiService.get(`/api/materials/${materialId}/access`, {
      params: { permission }
    });
    const hasAccess = response.data.hasAccess;
    
    // 添加到缓存
    cache.set(cacheKey, hasAccess, 'permission');
    
    return hasAccess;
  } catch (error) {
    console.error('检查素材访问权限失败:', error);
    return false; // 默认没有权限
  }
};

// 高级搜索素材
export const advancedSearchMaterials = async (params: {
  keyword?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  categoryId?: string;
  tags?: string[];
  uploaderId?: string;
  dateRange?: [string, string];
  sizeRange?: [number, number];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<MaterialListResponse> => {
  const cacheKey = generateCacheKey(params);
  const cachedData = cache.get(cacheKey, 'materialList');
  
  // 只有当搜索参数不包含随机因素时才使用缓存
  if (cachedData && !params.random) {
    console.log('从缓存获取高级搜索结果');
    return cachedData as MaterialListResponse;
  }

  if (USE_MOCK) {
    // 使用基本的模拟搜索功能
    return Promise.resolve(getMockMaterials(params));
  }

  try {
    const response = await apiService.post('/api/materials/advanced-search', params);
    
    // 添加到缓存（如果不是随机搜索）
    if (!params.random) {
      cache.set(cacheKey, response, 'materialList');
    }
    
    return response.data;
  } catch (error) {
    console.error('高级搜索素材失败:', error);
    message.error('高级搜索素材失败，使用模拟数据');
    return getMockMaterials(params);
  }
};

// 批量获取素材
export const getMaterialsByIds = async (ids: string[]): Promise<Material[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }
  
  // 检查缓存中是否有所有请求的素材
  const cachedMaterials: Material[] = [];
  const missingIds: string[] = [];
  
  ids.forEach(id => {
    const cachedMaterial = cache.get(id, 'material');
    if (cachedMaterial) {
      cachedMaterials.push(cachedMaterial as Material);
    } else {
      missingIds.push(id);
    }
  });
  
  // 如果所有素材都在缓存中，直接返回
  if (missingIds.length === 0) {
    console.log('从缓存获取所有素材');
    return cachedMaterials;
  }
  
  try {
    // 获取缓存中没有的素材
    const response = await apiService.post('/api/materials/batch', { ids: missingIds });
    const fetchedMaterials = response.items || [];
    
    // 添加到缓存
    fetchedMaterials.forEach((material: Material) => {
      cache.set(material.id, material, 'material');
    });
    
    // 合并缓存和新获取的素材
    return [...cachedMaterials, ...fetchedMaterials];
  } catch (error) {
    console.error('批量获取素材失败:', error);
    
    // 如果API调用失败但有部分缓存数据，返回缓存数据
    if (cachedMaterials.length > 0) {
      return cachedMaterials;
    }
    
    // 返回模拟数据
    return ids.map(id => ({
      id,
      title: `素材 ${id}`,
      description: '无法获取素材详情',
      url: '',
      type: MaterialType.OTHER,
      status: MaterialStatus.PENDING,
      categoryId: '',
      categoryName: '未分类',
      uploaderId: '',
      uploaderName: '未知',
      size: 0,
      downloadCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }
};

// 批量操作素材
export const batchOperateMaterials = async (
  operation: 'delete' | 'approve' | 'reject' | 'move',
  ids: string[],
  params?: any
): Promise<{ success: boolean; failedIds?: string[] }> => {
  if (!ids || ids.length === 0) {
    return { success: true };
  }
  
  try {
    const response = await apiService.post('/api/materials/batch-operation', {
      operation,
      ids,
      ...params
    });
    
    // 操作成功后清除相关缓存
    ids.forEach(id => {
      cache.remove(id, 'material');
    });
    cache.clear('materialList');
    
    return { success: true, ...response };
  } catch (error) {
    console.error(`批量${operation}素材失败:`, error);
    return { 
      success: false, 
      failedIds: ids 
    };
  }
};

// 获取素材统计数据
export const getMaterialStatistics = async (params?: { startDate?: string; endDate?: string }): Promise<MaterialStatistics> => {
  try {
    console.log('尝试从API获取素材统计数据:', config.API_BASE_URL + '/api/materials/statistics');
    const response = await apiService.get('/api/materials/statistics', params);
    return response.data;
  } catch (error) {
    console.error('获取素材统计数据失败，使用模拟数据', error);
    // 确保模拟数据函数存在
    return {
      totalMaterials: 0,
      totalSize: 0,
      totalDownloads: 0,
      byType: [],
      byStatus: [],
      byTimeRange: [],
      topDownloaded: [],
      recentUploaded: []
    };
  }
};

// 批量下载素材
export const batchDownloadMaterials = async (ids: string[]): Promise<string> => {
  if (!ids || ids.length === 0) {
    throw new Error('未选择要下载的素材');
  }
  
  try {
    const response = await apiService.post('/api/materials/batch-download', { ids }, { responseType: 'blob' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `materials-${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return url;
  } catch (error) {
    console.error('批量下载素材失败:', error);
    throw error;
  }
};

// 清除素材相关的所有缓存
export const clearMaterialCache = () => {
  cache.clear();
};

interface Material {
  id: string;
  title: string;
  type: string;
  format: string;
  description: string;
  author: string;
  uploadDate: string;
  size: number;
  url: string;
  courseId?: string;
  courseName?: string;
  downloadCount: number;
}

class MaterialService {
  /**
   * 获取学习材料列表
   * @returns 学习材料列表
   */
  async getMaterials(): Promise<Material[]> {
    try {
      console.log('正在获取学习材料数据...');
      
      // 优先使用模拟数据
      if (config.USE_MOCK_DATA) {
        console.log('尝试从模拟数据获取学习材料');
        try {
          const mockData = await mockDataLoader.loadMockData('materials');
          if (mockData && Array.isArray(mockData)) {
            console.log(`成功从模拟数据获取学习材料: ${mockData.length}`);
            return mockData;
          }
        } catch (mockError) {
          console.error('获取模拟学习材料数据失败，回退到API:', mockError);
        }
      }
      
      // 如果模拟数据获取失败或未启用，尝试使用API
      const response = await apiService.get('/api/materials');
      return response.items || [];
    } catch (error) {
      console.error('获取学习材料数据失败:', error);
      return [];
    }
  }
  
  /**
   * 获取学习材料详情
   * @param materialId 学习材料ID
   * @returns 学习材料详情
   */
  async getMaterialDetail(materialId: string): Promise<Material | null> {
    try {
      if (config.USE_MOCK_DATA) {
        try {
          const materials = await this.getMaterials();
          return materials.find(material => material.id === materialId) || null;
        } catch (mockError) {
          console.error('从模拟数据获取学习材料详情失败:', mockError);
        }
      }
      
      const response = await apiService.get(`/api/materials/${materialId}`);
      return response;
    } catch (error) {
      console.error(`获取学习材料详情失败[${materialId}]:`, error);
      return null;
    }
  }
}

export default new MaterialService(); 