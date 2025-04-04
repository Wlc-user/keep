import React, { useState } from 'react';
import { Modal, Form, Input, Select, Upload, Button, message, Tag } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { MaterialType, MaterialCategory, MaterialUploadParams } from '../types/material';
import { UPLOAD_CONFIG } from '../config';

const { Option } = Select;
const { TextArea } = Input;

interface UploadMaterialModalProps {
  open: boolean;
  onCancel: () => void;
  onUpload: (params: MaterialUploadParams) => Promise<void>;
  categories: MaterialCategory[];
}

const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  open,
  onCancel,
  onUpload,
  categories
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<MaterialType>(MaterialType.VIDEO);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 处理文件类型变更
  const handleTypeChange = (value: MaterialType) => {
    setSelectedType(value);
    setFileList([]);
  };

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const isValidType = validateFileType(file);
    const isValidSize = file.size <= UPLOAD_CONFIG.maxSize;

    if (!isValidType) {
      message.error('文件类型不支持！');
    }

    if (!isValidSize) {
      message.error(`文件大小不能超过 ${UPLOAD_CONFIG.maxSize / 1024 / 1024}MB！`);
    }

    return false; // 阻止自动上传
  };

  // 验证文件类型
  const validateFileType = (file: File) => {
    const acceptTypes = UPLOAD_CONFIG.acceptTypes[selectedType].split(',');
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return acceptTypes.includes(fileExt);
  };

  // 处理文件变更
  const handleFileChange = (info: any) => {
    setFileList(info.fileList.slice(-1)); // 只保留最后一个文件
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0) {
        message.error('请选择要上传的文件！');
        return;
      }

      setUploading(true);

      const uploadParams: MaterialUploadParams = {
        ...values,
        file: fileList[0].originFileObj,
        tags
      };

      await onUpload(uploadParams);
      
      message.success('素材上传成功！');
      form.resetFields();
      setFileList([]);
      setTags([]);
      onCancel();
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  // 处理标签相关操作
  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  // 递归渲染分类选项
  const renderCategoryOptions = (categories: MaterialCategory[], level = 0) => {
    return categories.map(category => {
      const prefix = level > 0 ? '　'.repeat(level) + '└ ' : '';
      
      const options = [
        <Option key={category.id} value={category.id}>
          {prefix + category.name}
        </Option>
      ];
      
      if (category.children && category.children.length > 0) {
        options.push(...renderCategoryOptions(category.children, level + 1));
      }
      
      return options;
    });
  };

  return (
    <Modal
      title="上传素材"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={uploading}
      okText="上传"
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: MaterialType.VIDEO }}
      >
        <Form.Item
          name="title"
          label="素材标题"
          rules={[{ required: true, message: '请输入素材标题' }]}
        >
          <Input placeholder="请输入素材标题" />
        </Form.Item>

        <Form.Item
          name="type"
          label="素材类型"
          rules={[{ required: true, message: '请选择素材类型' }]}
        >
          <Select onChange={handleTypeChange}>
            <Option value={MaterialType.VIDEO}>视频</Option>
            <Option value={MaterialType.DOCUMENT}>文档</Option>
            <Option value={MaterialType.AUDIO}>音频</Option>
            <Option value={MaterialType.IMAGE}>图片</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="所属分类"
          rules={[{ required: true, message: '请选择所属分类' }]}
        >
          <Select
            placeholder="请选择所属分类"
            showSearch
            optionFilterProp="children"
          >
            {renderCategoryOptions(categories)}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="素材描述"
        >
          <TextArea rows={4} placeholder="请输入素材描述" />
        </Form.Item>

        <Form.Item label="标签">
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <Tag
                key={tag}
                closable
                onClose={() => handleClose(tag)}
                style={{ marginBottom: 8 }}
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                type="text"
                size="small"
                style={{ width: 78, marginBottom: 8 }}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
                autoFocus
              />
            ) : (
              <Tag onClick={showInput} style={{ marginBottom: 8, cursor: 'pointer' }}>
                <PlusOutlined /> 添加标签
              </Tag>
            )}
          </div>
        </Form.Item>

        <Form.Item
          label="上传文件"
          required
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            fileList={fileList}
            accept={UPLOAD_CONFIG.acceptTypes[selectedType]}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#888' }}>
            支持的文件类型: {UPLOAD_CONFIG.acceptTypes[selectedType]}
            <br />
            文件大小限制: {UPLOAD_CONFIG.maxSize / 1024 / 1024}MB
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadMaterialModal; 