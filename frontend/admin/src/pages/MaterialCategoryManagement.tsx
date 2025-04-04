import React, { useState, useEffect } from 'react';
import { Tree, Button, Input, Form, Modal, message, Card, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Option } = Select;

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

const MaterialCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // 模拟获取分类数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      const mockCategories: Category[] = [
        {
          id: '1',
          name: '视频教程',
          parentId: null,
          children: [
            {
              id: '1-1',
              name: '编程语言',
              parentId: '1',
              children: [
                { id: '1-1-1', name: 'JavaScript', parentId: '1-1' },
                { id: '1-1-2', name: 'Python', parentId: '1-1' },
                { id: '1-1-3', name: 'Java', parentId: '1-1' },
              ]
            },
            { id: '1-2', name: '前端开发', parentId: '1' },
            { id: '1-3', name: '后端开发', parentId: '1' },
          ]
        },
        {
          id: '2',
          name: '文档资料',
          parentId: null,
          children: [
            { id: '2-1', name: '技术文档', parentId: '2' },
            { id: '2-2', name: '学术论文', parentId: '2' },
          ]
        },
        {
          id: '3',
          name: '音频讲座',
          parentId: null,
        },
        {
          id: '4',
          name: '图片素材',
          parentId: null,
        }
      ];
      
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId || 'root'
    });
    setModalVisible(true);
  };

  const handleDeleteCategory = (category: Category) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类 "${category.name}" 吗？如果有子分类，也会一并删除。`,
      onOk() {
        // 这里应该调用API删除分类
        message.success('分类删除成功');
        // 模拟删除成功后的数据更新
        const removeCategory = (list: Category[], id: string): Category[] => {
          return list.filter(item => {
            if (item.id === id) return false;
            if (item.children) {
              item.children = removeCategory(item.children, id);
            }
            return true;
          });
        };
        
        setCategories(removeCategory([...categories], category.id));
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      // 这里应该调用API保存分类
      if (editingCategory) {
        // 更新分类
        message.success('分类更新成功');
      } else {
        // 添加分类
        message.success('分类添加成功');
      }
      setModalVisible(false);
    });
  };

  const renderTreeNodes = (data: Category[]) => {
    return data.map(item => {
      const title = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{item.name}</span>
          <div onClick={e => e.stopPropagation()}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditCategory(item)}
            />
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => handleDeleteCategory(item)}
            />
          </div>
        </div>
      );
      
      if (item.children) {
        return {
          title,
          key: item.id,
          children: renderTreeNodes(item.children)
        };
      }
      
      return {
        title,
        key: item.id
      };
    });
  };

  return (
    <div>
      <PageHeader 
        title="分类管理" 
        subtitle="管理学习资料的分类结构" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddCategory}
          >
            添加分类
          </Button>
        }
      />

      <Card loading={loading}>
        {categories.length > 0 ? (
          <Tree
            showLine
            defaultExpandAll
            treeData={renderTreeNodes(categories)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            暂无分类数据
          </div>
        )}
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={{ parentId: 'root' }}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="父级分类"
          >
            <Select placeholder="请选择父级分类">
              <Option value="root">根分类</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialCategoryManagement; 