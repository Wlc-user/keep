import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Dropdown, 
  Space, 
  Divider, 
  Tooltip, 
  Tag,
  Form,
  Row,
  Col,
  Card
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownOutlined, 
  CloseOutlined,
  SaveOutlined,
  DeleteOutlined,
  HistoryOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';

export type FilterValueType = 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiSelect';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterValueType;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  options?: FilterOption[];
  placeholder?: string;
  showTime?: boolean;
  format?: string;
  disabledDate?: RangePickerProps['disabledDate'];
  width?: number | string;
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  valueEnd?: any; // 用于between操作符
}

export interface SavedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

export interface SearchBarProps {
  placeholder?: string;
  fields: FilterField[];
  onSearch: (keyword: string, filters: FilterCondition[]) => void;
  loading?: boolean;
  showFilterButton?: boolean;
  showSaveButton?: boolean;
  showHistoryButton?: boolean;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, conditions: FilterCondition[]) => void;
  onDeleteFilter?: (id: string) => void;
  onApplySavedFilter?: (filter: SavedFilter) => void;
  defaultKeyword?: string;
  defaultFilters?: FilterCondition[];
  allowEmptySearch?: boolean;
  maxConditions?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SearchBarContainer = styled.div`
  margin-bottom: 16px;
`;

const SearchInput = styled(Input.Search)`
  margin-bottom: 8px;
  
  .ant-input-wrapper {
    display: flex;
  }
  
  .ant-input {
    border-radius: 4px 0 0 4px;
  }
  
  .ant-input-search-button {
    border-radius: 0 4px 4px 0;
  }
`;

const FilterContainer = styled.div`
  background-color: var(--component-background, #ffffff);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--box-shadow-base);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--component-background, #1f1f1f);
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FilterTitle = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: var(--heading-color, #262626);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--heading-color, #e6e6e6);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 8px;
  }
`;

const FilterTag = styled(Tag)`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-right: 8px;
  border-radius: 4px;
  background-color: var(--item-hover-bg, #f5f5f5);
  border: 1px solid var(--border-color-split, #f0f0f0);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--item-hover-bg, #262626);
    border-color: var(--border-color-split, #303030);
  }
`;

const FilterTagLabel = styled.span`
  margin-right: 4px;
  color: var(--text-color-secondary, #595959);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const FilterTagValue = styled.span`
  color: var(--text-color, #434343);
  font-weight: 500;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color, #d9d9d9);
  }
`;

const FilterTagClose = styled(CloseOutlined)`
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-color-secondary, #595959);
  
  &:hover {
    color: var(--text-color, #434343);
  }
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
    
    &:hover {
      color: var(--text-color, #d9d9d9);
    }
  }
`;

const SaveFilterForm = styled(Form)`
  padding: 16px;
  min-width: 300px;
`;

/**
 * 高级搜索栏组件
 * 支持关键词搜索和多条件过滤
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  fields,
  onSearch,
  loading = false,
  showFilterButton = true,
  showSaveButton = true,
  showHistoryButton = true,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  onApplySavedFilter,
  defaultKeyword = '',
  defaultFilters = [],
  allowEmptySearch = true,
  maxConditions = 5,
  className,
  style,
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [showFilter, setShowFilter] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>(defaultFilters);
  const [saveFilterVisible, setSaveFilterVisible] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [saveFilterForm] = Form.useForm();
  
  // 生成唯一ID
  const generateId = () => {
    return `filter_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // 处理搜索
  const handleSearch = () => {
    if (!allowEmptySearch && !keyword && conditions.length === 0) {
      return;
    }
    
    onSearch(keyword, conditions);
  };
  
  // 处理关键词变化
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };
  
  // 处理按下回车
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 切换过滤器显示
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  // 添加过滤条件
  const addCondition = () => {
    if (conditions.length >= maxConditions) {
      return;
    }
    
    const field = fields[0];
    const operator = field.defaultOperator || getDefaultOperator(field.type);
    
    const newCondition: FilterCondition = {
      id: generateId(),
      field: field.key,
      operator,
      value: null,
    };
    
    setConditions([...conditions, newCondition]);
  };
  
  // 获取默认操作符
  const getDefaultOperator = (type: FilterValueType): FilterOperator => {
    switch (type) {
      case 'string':
        return 'contains';
      case 'number':
      case 'date':
        return 'equals';
      case 'boolean':
        return 'equals';
      case 'select':
      case 'multiSelect':
        return 'in';
      default:
        return 'equals';
    }
  };
  
  // 获取字段可用的操作符
  const getFieldOperators = (field: FilterField): FilterOperator[] => {
    if (field.operators) {
      return field.operators;
    }
    
    switch (field.type) {
      case 'string':
        return ['equals', 'contains', 'startsWith', 'endsWith'];
      case 'number':
        return ['equals', 'greaterThan', 'lessThan', 'between'];
      case 'date':
        return ['equals', 'greaterThan', 'lessThan', 'between'];
      case 'boolean':
        return ['equals'];
      case 'select':
        return ['equals', 'in'];
      case 'multiSelect':
        return ['in'];
      default:
        return ['equals'];
    }
  };
  
  // 获取操作符显示文本
  const getOperatorLabel = (operator: FilterOperator): string => {
    switch (operator) {
      case 'equals':
        return '等于';
      case 'contains':
        return '包含';
      case 'startsWith':
        return '开头是';
      case 'endsWith':
        return '结尾是';
      case 'greaterThan':
        return '大于';
      case 'lessThan':
        return '小于';
      case 'between':
        return '介于';
      case 'in':
        return '属于';
      default:
        return operator;
    }
  };
  
  // 更新条件字段
  const updateConditionField = (id: string, fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;
    
    const operator = field.defaultOperator || getDefaultOperator(field.type);
    
    setConditions(conditions.map(condition => {
      if (condition.id === id) {
        return {
          ...condition,
          field: fieldKey,
          operator,
          value: null,
          valueEnd: undefined,
        };
      }
      return condition;
    }));
  };
  
  // 更新条件操作符
  const updateConditionOperator = (id: string, operator: FilterOperator) => {
    setConditions(conditions.map(condition => {
      if (condition.id === id) {
        return {
          ...condition,
          operator,
          value: operator === 'between' ? condition.value : null,
          valueEnd: operator === 'between' ? condition.valueEnd : undefined,
        };
      }
      return condition;
    }));
  };
  
  // 更新条件值
  const updateConditionValue = (id: string, value: any) => {
    setConditions(conditions.map(condition => {
      if (condition.id === id) {
        return {
          ...condition,
          value,
        };
      }
      return condition;
    }));
  };
  
  // 更新条件结束值（用于between操作符）
  const updateConditionValueEnd = (id: string, valueEnd: any) => {
    setConditions(conditions.map(condition => {
      if (condition.id === id) {
        return {
          ...condition,
          valueEnd,
        };
      }
      return condition;
    }));
  };
  
  // 删除条件
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };
  
  // 清除所有条件
  const clearAllConditions = () => {
    setConditions([]);
  };
  
  // 渲染条件值输入
  const renderValueInput = (condition: FilterCondition) => {
    const field = fields.find(f => f.key === condition.field);
    if (!field) return null;
    
    const { type, placeholder, options, showTime, format, disabledDate, width } = field;
    const inputWidth = width || '100%';
    
    // 处理between操作符
    if (condition.operator === 'between') {
      if (type === 'number') {
        return (
          <Space>
            <Input
              type="number"
              placeholder="最小值"
              value={condition.value}
              onChange={e => updateConditionValue(condition.id, e.target.value ? Number(e.target.value) : null)}
              style={{ width: 100 }}
            />
            <span>至</span>
            <Input
              type="number"
              placeholder="最大值"
              value={condition.valueEnd}
              onChange={e => updateConditionValueEnd(condition.id, e.target.value ? Number(e.target.value) : null)}
              style={{ width: 100 }}
            />
          </Space>
        );
      }
      
      if (type === 'date') {
        return (
          <RangePicker
            value={condition.value && condition.valueEnd ? [dayjs(condition.value), dayjs(condition.valueEnd)] : null}
            onChange={(dates) => {
              if (dates) {
                updateConditionValue(condition.id, dates[0]?.toISOString());
                updateConditionValueEnd(condition.id, dates[1]?.toISOString());
              } else {
                updateConditionValue(condition.id, null);
                updateConditionValueEnd(condition.id, null);
              }
            }}
            showTime={showTime}
            format={format || 'YYYY-MM-DD'}
            disabledDate={disabledDate}
            style={{ width: inputWidth }}
          />
        );
      }
    }
    
    // 处理其他操作符
    switch (type) {
      case 'string':
        return (
          <Input
            placeholder={placeholder || '请输入'}
            value={condition.value}
            onChange={e => updateConditionValue(condition.id, e.target.value)}
            style={{ width: inputWidth }}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder || '请输入数字'}
            value={condition.value}
            onChange={e => updateConditionValue(condition.id, e.target.value ? Number(e.target.value) : null)}
            style={{ width: inputWidth }}
          />
        );
      
      case 'date':
        return (
          <DatePicker
            placeholder={placeholder || '请选择日期'}
            value={condition.value ? dayjs(condition.value) : null}
            onChange={(date) => updateConditionValue(condition.id, date ? date.toISOString() : null)}
            showTime={showTime}
            format={format || 'YYYY-MM-DD'}
            disabledDate={disabledDate}
            style={{ width: inputWidth }}
          />
        );
      
      case 'boolean':
        return (
          <Select
            placeholder={placeholder || '请选择'}
            value={condition.value}
            onChange={value => updateConditionValue(condition.id, value)}
            style={{ width: inputWidth }}
          >
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        );
      
      case 'select':
        return (
          <Select
            placeholder={placeholder || '请选择'}
            value={condition.value}
            onChange={value => updateConditionValue(condition.id, value)}
            style={{ width: inputWidth }}
          >
            {options?.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        );
      
      case 'multiSelect':
        return (
          <Select
            placeholder={placeholder || '请选择'}
            mode="multiple"
            value={condition.value}
            onChange={value => updateConditionValue(condition.id, value)}
            style={{ width: inputWidth }}
          >
            {options?.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        );
      
      default:
        return null;
    }
  };
  
  // 获取条件显示文本
  const getConditionDisplayText = (condition: FilterCondition): string => {
    const field = fields.find(f => f.key === condition.field);
    if (!field) return '';
    
    const { type, options } = field;
    const operatorText = getOperatorLabel(condition.operator);
    
    let valueText = '';
    
    if (condition.operator === 'between') {
      if (type === 'date' && condition.value && condition.valueEnd) {
        const format = field.format || 'YYYY-MM-DD';
        const startDate = dayjs(condition.value).format(format);
        const endDate = dayjs(condition.valueEnd).format(format);
        valueText = `${startDate} 至 ${endDate}`;
      } else if (condition.value !== null && condition.valueEnd !== null) {
        valueText = `${condition.value} 至 ${condition.valueEnd}`;
      }
    } else {
      switch (type) {
        case 'boolean':
          valueText = condition.value === true ? '是' : condition.value === false ? '否' : '';
          break;
        
        case 'date':
          if (condition.value) {
            const format = field.format || 'YYYY-MM-DD';
            valueText = dayjs(condition.value).format(format);
          }
          break;
        
        case 'select':
          if (condition.value !== null) {
            const option = options?.find(opt => opt.value === condition.value);
            valueText = option?.label || condition.value;
          }
          break;
        
        case 'multiSelect':
          if (Array.isArray(condition.value) && condition.value.length > 0) {
            const selectedOptions = options?.filter(opt => condition.value.includes(opt.value));
            valueText = selectedOptions?.map(opt => opt.label).join(', ') || condition.value.join(', ');
          }
          break;
        
        default:
          valueText = condition.value !== null ? String(condition.value) : '';
      }
    }
    
    return `${field.label} ${operatorText} ${valueText}`;
  };
  
  // 渲染过滤条件
  const renderCondition = (condition: FilterCondition) => {
    const field = fields.find(f => f.key === condition.field);
    if (!field) return null;
    
    return (
      <FilterRow key={condition.id}>
        <FilterItem>
          <Select
            value={condition.field}
            onChange={value => updateConditionField(condition.id, value)}
            style={{ width: 120 }}
          >
            {fields.map(field => (
              <Option key={field.key} value={field.key}>{field.label}</Option>
            ))}
          </Select>
          
          <Select
            value={condition.operator}
            onChange={value => updateConditionOperator(condition.id, value as FilterOperator)}
            style={{ width: 100 }}
          >
            {getFieldOperators(field).map(operator => (
              <Option key={operator} value={operator}>{getOperatorLabel(operator)}</Option>
            ))}
          </Select>
          
          {renderValueInput(condition)}
          
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => removeCondition(condition.id)}
          />
        </FilterItem>
      </FilterRow>
    );
  };
  
  // 渲染过滤器标签
  const renderFilterTags = () => {
    if (conditions.length === 0) return null;
    
    return (
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        {conditions.map(condition => (
          <FilterTag key={condition.id}>
            <FilterTagLabel>{getConditionDisplayText(condition)}</FilterTagLabel>
            <FilterTagClose onClick={() => removeCondition(condition.id)} />
          </FilterTag>
        ))}
        
        {conditions.length > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={clearAllConditions}
          >
            清除全部
          </Button>
        )}
      </div>
    );
  };
  
  // 处理保存过滤器
  const handleSaveFilter = () => {
    saveFilterForm.validateFields().then(values => {
      if (onSaveFilter) {
        onSaveFilter(values.name, conditions);
        setSaveFilterVisible(false);
        saveFilterForm.resetFields();
      }
    });
  };
  
  // 渲染保存过滤器表单
  const renderSaveFilterForm = () => {
    return (
      <SaveFilterForm
        form={saveFilterForm}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="过滤器名称"
          rules={[{ required: true, message: '请输入过滤器名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" onClick={handleSaveFilter}>
            保存
          </Button>
        </Form.Item>
      </SaveFilterForm>
    );
  };
  
  // 渲染历史过滤器菜单
  const renderHistoryMenu = () => {
    if (savedFilters.length === 0) {
      return {
        items: [
          {
            key: 'empty',
            label: '暂无保存的过滤器',
            disabled: true,
          },
        ],
      };
    }
    
    return {
      items: savedFilters.map(filter => ({
        key: filter.id,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{filter.name}</span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteFilter) {
                  onDeleteFilter(filter.id);
                }
              }}
            />
          </div>
        ),
        onClick: () => {
          if (onApplySavedFilter) {
            onApplySavedFilter(filter);
          }
        },
      })),
    };
  };
  
  return (
    <SearchBarContainer className={className} style={style}>
      <Row gutter={8} align="middle">
        <Col flex="auto">
          <SearchInput
            placeholder={placeholder}
            value={keyword}
            onChange={handleKeywordChange}
            onKeyPress={handleKeyPress}
            onSearch={handleSearch}
            loading={loading}
            enterButton
          />
        </Col>
        
        {showFilterButton && (
          <Col>
            <Tooltip title="高级筛选">
              <Button
                icon={<FilterOutlined />}
                onClick={toggleFilter}
                type={showFilter || conditions.length > 0 ? 'primary' : 'default'}
              >
                筛选
                {conditions.length > 0 && ` (${conditions.length})`}
              </Button>
            </Tooltip>
          </Col>
        )}
        
        {showSaveButton && conditions.length > 0 && (
          <Col>
            <Tooltip title="保存筛选条件">
              <Dropdown
                open={saveFilterVisible}
                onOpenChange={setSaveFilterVisible}
                dropdownRender={() => renderSaveFilterForm()}
                trigger={['click']}
              >
                <Button icon={<SaveOutlined />}>
                  保存
                </Button>
              </Dropdown>
            </Tooltip>
          </Col>
        )}
        
        {showHistoryButton && savedFilters.length > 0 && (
          <Col>
            <Tooltip title="历史筛选条件">
              <Dropdown menu={renderHistoryMenu()} trigger={['click']}>
                <Button icon={<HistoryOutlined />}>
                  历史
                </Button>
              </Dropdown>
            </Tooltip>
          </Col>
        )}
      </Row>
      
      {renderFilterTags()}
      
      {showFilter && (
        <FilterContainer>
          <FilterHeader>
            <FilterTitle>高级筛选</FilterTitle>
            <FilterActions>
              <Button 
                type="primary" 
                size="small" 
                icon={<SearchOutlined />} 
                onClick={handleSearch}
                loading={loading}
              >
                搜索
              </Button>
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={clearAllConditions}
                disabled={conditions.length === 0}
              >
                重置
              </Button>
            </FilterActions>
          </FilterHeader>
          
          {conditions.map(renderCondition)}
          
          <Button
            type="dashed"
            onClick={addCondition}
            style={{ width: '100%' }}
            disabled={conditions.length >= maxConditions}
          >
            添加条件
          </Button>
          
          {conditions.length >= maxConditions && (
            <div style={{ marginTop: 8, color: 'var(--text-color-secondary, #595959)' }}>
              最多添加 {maxConditions} 个条件
            </div>
          )}
        </FilterContainer>
      )}
    </SearchBarContainer>
  );
};

export default SearchBar; 