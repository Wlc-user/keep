import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * 虚拟列表选项
 */
export interface VirtualListOptions {
  itemHeight: number | ((index: number) => number);
  overscan?: number;
  key?: string;
}

/**
 * 虚拟列表项
 */
export interface VirtualItem<T> {
  data: T;
  index: number;
  style: {
    position: 'absolute';
    top: number;
    left: 0;
    width: '100%';
    height: number;
  };
}

/**
 * 虚拟列表结果
 */
export interface VirtualListResult<T> {
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: {
      position: 'relative';
      height: number;
      overflow: 'auto';
    };
    onScroll: (e: React.UIEvent) => void;
  };
  virtualItems: VirtualItem<T>[];
  scrollTo: (index: number) => void;
  scrollToItem: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void;
}

/**
 * 虚拟列表Hook
 * @param data 列表数据
 * @param options 虚拟列表选项
 * @returns 虚拟列表结果
 */
export function useVirtualList<T>(
  data: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, overscan = 3, key } = options;
  
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0);
  
  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent) => {
    const { scrollTop } = e.currentTarget as HTMLDivElement;
    setScrollTop(scrollTop);
  }, []);
  
  // 计算每个项目的高度
  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );
  
  // 计算项目位置
  const getItemPos = useCallback(
    (index: number) => {
      let start = 0;
      for (let i = 0; i < index; i++) {
        start += getItemHeight(i);
      }
      return start;
    },
    [getItemHeight]
  );
  
  // 计算总高度
  const totalHeight = useMemo(() => {
    return data.reduce((sum, _, index) => sum + getItemHeight(index), 0);
  }, [data, getItemHeight]);
  
  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!containerRef.current) {
      return { start: 0, end: 10 };
    }
    
    const { clientHeight } = containerRef.current;
    
    let start = 0;
    let currentPos = 0;
    
    // 找到第一个可见项
    while (start < data.length && currentPos < scrollTop) {
      currentPos += getItemHeight(start);
      start++;
    }
    
    // 向上额外渲染几个项目
    start = Math.max(0, start - 1 - overscan);
    
    let end = start;
    currentPos = getItemPos(start);
    
    // 找到最后一个可见项
    while (end < data.length && currentPos < scrollTop + clientHeight) {
      currentPos += getItemHeight(end);
      end++;
    }
    
    // 向下额外渲染几个项目
    end = Math.min(data.length, end + overscan);
    
    return { start, end };
  }, [data.length, scrollTop, getItemHeight, getItemPos, overscan]);
  
  // 生成虚拟项
  const virtualItems = useMemo(() => {
    const { start, end } = visibleRange;
    const items: VirtualItem<T>[] = [];
    
    for (let i = start; i < end; i++) {
      const itemData = data[i];
      const itemKey = key ? (itemData as any)[key] : i;
      
      items.push({
        data: itemData,
        index: i,
        style: {
          position: 'absolute',
          top: getItemPos(i),
          left: 0,
          width: '100%',
          height: getItemHeight(i)
        }
      });
    }
    
    return items;
  }, [data, visibleRange, getItemPos, getItemHeight, key]);
  
  // 滚动到指定位置
  const scrollTo = useCallback(
    (offset: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = offset;
      }
    },
    []
  );
  
  // 滚动到指定项
  const scrollToItem = useCallback(
    (index: number, align: 'auto' | 'start' | 'center' | 'end' = 'auto') => {
      if (!containerRef.current) return;
      
      const { clientHeight } = containerRef.current;
      const itemPos = getItemPos(index);
      const itemHeight = getItemHeight(index);
      
      let offset: number;
      
      switch (align) {
        case 'start':
          offset = itemPos;
          break;
        case 'center':
          offset = itemPos - clientHeight / 2 + itemHeight / 2;
          break;
        case 'end':
          offset = itemPos - clientHeight + itemHeight;
          break;
        case 'auto':
        default:
          if (itemPos < scrollTop) {
            // 项目在可视区域上方，滚动到顶部
            offset = itemPos;
          } else if (itemPos + itemHeight > scrollTop + clientHeight) {
            // 项目在可视区域下方，滚动到底部
            offset = itemPos - clientHeight + itemHeight;
          } else {
            // 项目已在可视区域内，不滚动
            return;
          }
      }
      
      scrollTo(offset);
    },
    [getItemPos, getItemHeight, scrollTop, scrollTo]
  );
  
  // 容器属性
  const containerProps = useMemo(
    () => ({
      ref: containerRef,
      style: {
        position: 'relative' as const,
        height: '100%',
        overflow: 'auto' as const
      },
      onScroll: handleScroll
    }),
    [handleScroll]
  );
  
  return {
    containerProps,
    virtualItems,
    scrollTo,
    scrollToItem
  };
}

/**
 * 网格虚拟列表选项
 */
export interface VirtualGridOptions extends VirtualListOptions {
  columnCount: number;
  columnWidth: number | ((index: number) => number);
  rowGap?: number;
  columnGap?: number;
}

/**
 * 网格虚拟列表项
 */
export interface VirtualGridItem<T> {
  data: T;
  index: number;
  row: number;
  column: number;
  style: {
    position: 'absolute';
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * 网格虚拟列表结果
 */
export interface VirtualGridResult<T> {
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: {
      position: 'relative';
      height: number;
      overflow: 'auto';
    };
    onScroll: (e: React.UIEvent) => void;
  };
  virtualItems: VirtualGridItem<T>[];
  scrollTo: (offset: number) => void;
  scrollToItem: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void;
}

/**
 * 网格虚拟列表Hook
 * @param data 列表数据
 * @param options 网格虚拟列表选项
 * @returns 网格虚拟列表结果
 */
export function useVirtualGrid<T>(
  data: T[],
  options: VirtualGridOptions
): VirtualGridResult<T> {
  const {
    itemHeight,
    columnCount,
    columnWidth,
    overscan = 3,
    rowGap = 0,
    columnGap = 0,
    key
  } = options;
  
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0);
  
  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent) => {
    const { scrollTop } = e.currentTarget as HTMLDivElement;
    setScrollTop(scrollTop);
  }, []);
  
  // 计算行数
  const rowCount = useMemo(() => {
    return Math.ceil(data.length / columnCount);
  }, [data.length, columnCount]);
  
  // 计算每个项目的高度
  const getItemHeight = useCallback(
    (rowIndex: number) => {
      return typeof itemHeight === 'function' ? itemHeight(rowIndex) : itemHeight;
    },
    [itemHeight]
  );
  
  // 计算每个项目的宽度
  const getColumnWidth = useCallback(
    (columnIndex: number) => {
      return typeof columnWidth === 'function' ? columnWidth(columnIndex) : columnWidth;
    },
    [columnWidth]
  );
  
  // 计算行位置
  const getRowPos = useCallback(
    (rowIndex: number) => {
      let pos = 0;
      for (let i = 0; i < rowIndex; i++) {
        pos += getItemHeight(i) + rowGap;
      }
      return pos;
    },
    [getItemHeight, rowGap]
  );
  
  // 计算列位置
  const getColumnPos = useCallback(
    (columnIndex: number) => {
      let pos = 0;
      for (let i = 0; i < columnIndex; i++) {
        pos += getColumnWidth(i) + columnGap;
      }
      return pos;
    },
    [getColumnWidth, columnGap]
  );
  
  // 计算总高度
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < rowCount; i++) {
      height += getItemHeight(i);
      if (i < rowCount - 1) {
        height += rowGap;
      }
    }
    return height;
  }, [rowCount, getItemHeight, rowGap]);
  
  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!containerRef.current) {
      return { startRow: 0, endRow: 10 };
    }
    
    const { clientHeight } = containerRef.current;
    
    let startRow = 0;
    let currentPos = 0;
    
    // 找到第一个可见行
    while (startRow < rowCount && currentPos < scrollTop) {
      currentPos += getItemHeight(startRow) + rowGap;
      startRow++;
    }
    
    // 向上额外渲染几行
    startRow = Math.max(0, startRow - 1 - overscan);
    
    let endRow = startRow;
    currentPos = getRowPos(startRow);
    
    // 找到最后一个可见行
    while (endRow < rowCount && currentPos < scrollTop + clientHeight) {
      currentPos += getItemHeight(endRow) + rowGap;
      endRow++;
    }
    
    // 向下额外渲染几行
    endRow = Math.min(rowCount, endRow + overscan);
    
    return { startRow, endRow };
  }, [rowCount, scrollTop, getItemHeight, getRowPos, rowGap, overscan]);
  
  // 生成虚拟项
  const virtualItems = useMemo(() => {
    const { startRow, endRow } = visibleRange;
    const items: VirtualGridItem<T>[] = [];
    
    for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
      const rowPos = getRowPos(rowIndex);
      const rowHeight = getItemHeight(rowIndex);
      
      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        const itemIndex = rowIndex * columnCount + colIndex;
        
        if (itemIndex >= data.length) break;
        
        const itemData = data[itemIndex];
        const colPos = getColumnPos(colIndex);
        const colWidth = getColumnWidth(colIndex);
        
        items.push({
          data: itemData,
          index: itemIndex,
          row: rowIndex,
          column: colIndex,
          style: {
            position: 'absolute',
            top: rowPos,
            left: colPos,
            width: colWidth,
            height: rowHeight
          }
        });
      }
    }
    
    return items;
  }, [
    data,
    visibleRange,
    columnCount,
    getRowPos,
    getColumnPos,
    getItemHeight,
    getColumnWidth
  ]);
  
  // 滚动到指定位置
  const scrollTo = useCallback(
    (offset: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = offset;
      }
    },
    []
  );
  
  // 滚动到指定项
  const scrollToItem = useCallback(
    (index: number, align: 'auto' | 'start' | 'center' | 'end' = 'auto') => {
      if (!containerRef.current) return;
      
      const { clientHeight } = containerRef.current;
      const rowIndex = Math.floor(index / columnCount);
      const rowPos = getRowPos(rowIndex);
      const rowHeight = getItemHeight(rowIndex);
      
      let offset: number;
      
      switch (align) {
        case 'start':
          offset = rowPos;
          break;
        case 'center':
          offset = rowPos - clientHeight / 2 + rowHeight / 2;
          break;
        case 'end':
          offset = rowPos - clientHeight + rowHeight;
          break;
        case 'auto':
        default:
          if (rowPos < scrollTop) {
            // 项目在可视区域上方，滚动到顶部
            offset = rowPos;
          } else if (rowPos + rowHeight > scrollTop + clientHeight) {
            // 项目在可视区域下方，滚动到底部
            offset = rowPos - clientHeight + rowHeight;
          } else {
            // 项目已在可视区域内，不滚动
            return;
          }
      }
      
      scrollTo(offset);
    },
    [columnCount, getRowPos, getItemHeight, scrollTop, scrollTo]
  );
  
  // 容器属性
  const containerProps = useMemo(
    () => ({
      ref: containerRef,
      style: {
        position: 'relative' as const,
        height: '100%',
        overflow: 'auto' as const
      },
      onScroll: handleScroll
    }),
    [handleScroll]
  );
  
  return {
    containerProps,
    virtualItems,
    scrollTo,
    scrollToItem
  };
} 