import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getMemoryCache, setMemoryCache } from '../utils/cacheUtils';

/**
 * 数据获取选项
 */
interface FetchOptions<T> {
  initialData?: T;
  dependencies?: any[];
  cacheKey?: string;
  cacheTTL?: number;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  skipInitialFetch?: boolean;
  retryCount?: number;
  retryDelay?: number;
  showErrorMessage?: boolean;
}

/**
 * 数据获取结果
 */
interface FetchResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
  updateData: (updater: (prevData: T) => T) => void;
}

/**
 * 数据获取Hook
 * @param fetchFn 获取数据的函数
 * @param options 选项
 * @returns 数据获取结果
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions<T> = {}
): FetchResult<T> {
  const {
    initialData,
    dependencies = [],
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 默认缓存5分钟
    errorMessage = '获取数据失败',
    onSuccess,
    onError,
    skipInitialFetch = false,
    retryCount = 0,
    retryDelay = 1000,
    showErrorMessage = true,
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);

  // 更新数据的函数
  const updateData = useCallback((updater: (prevData: T) => T) => {
    setData(prevData => {
      const newData = updater(prevData);
      // 如果有缓存键，更新缓存
      if (cacheKey) {
        setMemoryCache(cacheKey, newData, cacheTTL);
      }
      return newData;
    });
  }, [cacheKey, cacheTTL]);

  // 获取数据的函数
  const fetchData = useCallback(async (retries = 0) => {
    setLoading(true);
    setError(null);

    try {
      // 如果有缓存键，先尝试从缓存获取
      if (cacheKey) {
        const cachedData = getMemoryCache<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onSuccess?.(cachedData);
          return;
        }
      }

      // 获取数据
      const result = await fetchFn();
      
      // 更新状态和缓存
      setData(result);
      setLoading(false);
      
      if (cacheKey) {
        setMemoryCache(cacheKey, result, cacheTTL);
      }
      
      onSuccess?.(result);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      
      // 重试逻辑
      if (retries < retryCount) {
        setTimeout(() => {
          fetchData(retries + 1);
        }, retryDelay);
        return;
      }
      
      setError(fetchError);
      setLoading(false);
      
      if (showErrorMessage) {
        message.error(errorMessage);
      }
      
      onError?.(fetchError);
    }
  }, [fetchFn, cacheKey, cacheTTL, errorMessage, onSuccess, onError, retryCount, retryDelay, showErrorMessage]);

  // 重新获取数据的函数
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // 初始获取数据
  useEffect(() => {
    if (!skipInitialFetch) {
      fetchData();
    }
  }, [...dependencies, fetchData]);

  return { data, loading, error, refetch, setData, updateData };
}

/**
 * 分页数据获取选项
 */
interface PaginatedFetchOptions<T> extends FetchOptions<T> {
  pageSize?: number;
  initialPage?: number;
}

/**
 * 分页数据
 */
interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分页数据获取结果
 */
interface PaginatedFetchResult<T> {
  data: PaginatedData<T>;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => Promise<void>;
}

/**
 * 分页数据获取Hook
 * @param fetchFn 获取数据的函数
 * @param options 选项
 * @returns 分页数据获取结果
 */
export function usePaginatedDataFetching<T>(
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedData<T>>,
  options: PaginatedFetchOptions<PaginatedData<T>> = {}
): PaginatedFetchResult<T> {
  const {
    pageSize: initialPageSize = 10,
    initialPage = 1,
    ...restOptions
  } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // 包装获取函数，添加分页参数
  const wrappedFetchFn = useCallback(() => {
    return fetchFn(page, pageSize);
  }, [fetchFn, page, pageSize]);

  // 使用基本的数据获取Hook
  const { data, loading, error, refetch } = useDataFetching<PaginatedData<T>>(
    wrappedFetchFn,
    {
      ...restOptions,
      dependencies: [...(restOptions.dependencies || []), page, pageSize],
      initialData: {
        items: [],
        total: 0,
        page,
        pageSize
      }
    }
  );

  // 处理页码变化
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // 处理每页条数变化
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 重置到第一页
  }, []);

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    total: data.total,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    refetch
  };
}

/**
 * 无限滚动数据获取选项
 */
interface InfiniteScrollOptions<T> extends FetchOptions<T[]> {
  pageSize?: number;
  threshold?: number;
}

/**
 * 无限滚动数据获取结果
 */
interface InfiniteScrollResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * 无限滚动数据获取Hook
 * @param fetchFn 获取数据的函数
 * @param options 选项
 * @returns 无限滚动数据获取结果
 */
export function useInfiniteScroll<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[], total: number }>,
  options: InfiniteScrollOptions<T> = {}
): InfiniteScrollResult<T> {
  const {
    pageSize = 10,
    threshold = 0.8,
    ...restOptions
  } = options;

  const [data, setData] = useState<T[]>(restOptions.initialData || []);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(page, pageSize);
      
      setData(prevData => [...prevData, ...result.items]);
      setTotal(result.total);
      setHasMore(page * pageSize < result.total);
      setPage(prevPage => prevPage + 1);
      
      restOptions.onSuccess?.(result.items);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
      
      if (restOptions.showErrorMessage !== false) {
        message.error(restOptions.errorMessage || '加载更多数据失败');
      }
      
      restOptions.onError?.(fetchError);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore, restOptions]);

  // 重置数据
  const reset = useCallback(() => {
    setData(restOptions.initialData || []);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [restOptions.initialData]);

  // 初始加载
  useEffect(() => {
    if (!restOptions.skipInitialFetch) {
      loadMore();
    }
  }, [...(restOptions.dependencies || [])]);

  // 设置滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      // 当滚动到阈值位置时加载更多
      if (scrollTop + clientHeight >= scrollHeight * threshold) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadMore, threshold]);

  return { data, loading, error, hasMore, loadMore, reset };
} 