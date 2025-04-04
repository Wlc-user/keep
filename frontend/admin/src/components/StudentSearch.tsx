import React, { useState, useEffect, useMemo } from 'react';
import { Input, Select, Card, List, Avatar, Tag, Space, Typography, Empty, Spin, Badge, Tooltip } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;
const { Option } = Select;

// 学生接口
export interface Student {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  studentId?: string;
  department?: string;
  grade?: string;
  tags?: string[];
  score?: number;
  status?: 'active' | 'inactive' | 'graduated';
}

// 班级接口
export interface Class {
  id: string;
  name: string;
  count: number;
  department?: string;
}

// 组件属性
interface StudentSearchProps {
  students: Student[];
  classes?: Class[];
  loading?: boolean;
  onSelect: (student: Student) => void;
  selectedStudentId?: string;
  showScore?: boolean;
  emptyDescription?: string;
}

// 排序类型
type SortType = 'name' | 'className' | 'score' | 'none';
type SortOrder = 'asc' | 'desc';

// 样式化组件
const StyledList = styled(List<Student>)`
  .ant-list-item {
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--item-hover-bg, rgba(0, 0, 0, 0.02));
    }
    
    &.selected {
      background-color: var(--primary-1, #e6f7ff);
      border-left: 2px solid var(--primary-color, #1890ff);
    }
  }
`;

// 学生查询组件
const StudentSearch: React.FC<StudentSearchProps> = ({
  students,
  classes = [],
  loading = false,
  onSelect,
  selectedStudentId,
  showScore = false,
  emptyDescription = "未找到学生数据"
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 过滤和排序后的学生列表
  const filteredStudents = useMemo(() => {
    // 应用过滤条件
    let result = students.filter(student => {
      // 名称筛选
      const nameMatch = student.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        (student.studentId && student.studentId.toLowerCase().includes(searchText.toLowerCase()));
      
      // 班级筛选
      const classMatch = selectedClass === 'all' || student.className === selectedClass;
      
      return nameMatch && classMatch;
    });
    
    // 应用排序
    if (sortType !== 'none') {
      result = [...result].sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (sortType) {
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'className':
            valueA = a.className;
            valueB = b.className;
            break;
          case 'score':
            valueA = a.score || 0;
            valueB = b.score || 0;
            break;
          default:
            return 0;
        }
        
        // 字符串比较
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        // 数字比较
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }
    
    return result;
  }, [students, searchText, selectedClass, sortType, sortOrder]);
  
  // 处理学生点击
  const handleStudentClick = (student: Student) => {
    onSelect(student);
  };
  
  // 处理排序变化
  const handleSortChange = (value: SortType) => {
    if (value === sortType) {
      // 如果点击同一个字段，切换排序顺序
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 如果是新字段，使用升序
      setSortType(value);
      setSortOrder('asc');
    }
  };
  
  // 获取学生状态标签
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'active':
        return <Badge status="success" text="在读" />;
      case 'inactive':
        return <Badge status="warning" text="休学" />;
      case 'graduated':
        return <Badge status="default" text="毕业" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%' }} wrap>
          <Input
            placeholder="搜索学生姓名或学号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          
          <Select
            placeholder="选择班级"
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 200 }}
          >
            <Option value="all">所有班级</Option>
            {classes.map(cls => (
              <Option key={cls.id} value={cls.name}>
                {cls.name} ({cls.count}人)
              </Option>
            ))}
          </Select>
          
          <Space>
            <Text>排序:</Text>
            <Select 
              value={sortType} 
              onChange={handleSortChange}
              dropdownMatchSelectWidth={false}
              style={{ width: 120 }}
            >
              <Option value="name">姓名</Option>
              <Option value="className">班级</Option>
              {showScore && <Option value="score">评分</Option>}
              <Option value="none">默认</Option>
            </Select>
            
            <Tooltip title={sortOrder === 'asc' ? '升序' : '降序'}>
              <div onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ cursor: 'pointer' }}>
                {sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              </div>
            </Tooltip>
          </Space>
        </Space>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
            <div style={{ marginTop: 16 }}>加载学生数据...</div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <StyledList
            dataSource={filteredStudents}
            renderItem={(student: Student) => (
              <List.Item 
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className={student.id === selectedStudentId ? 'selected' : ''}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={student.avatar} icon={<UserOutlined />} />
                  }
                  title={
                    <Space>
                      <span>{student.name}</span>
                      {student.studentId && <Text type="secondary">{student.studentId}</Text>}
                      {getStatusBadge(student.status)}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Space>
                        <TeamOutlined />
                        <span>{student.className}</span>
                      </Space>
                      {student.tags && student.tags.length > 0 && (
                        <Space wrap>
                          {student.tags.map(tag => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </Space>
                      )}
                    </Space>
                  }
                />
                
                {showScore && student.score !== undefined && (
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>
                      {student.score}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                      分
                    </Text>
                  </div>
                )}
              </List.Item>
            )}
          />
        ) : (
          <Empty description={emptyDescription} />
        )}
        
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary">
            共 {filteredStudents.length} 名学生
            {filteredStudents.length < students.length && ` (共${students.length}名)`}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default StudentSearch; 