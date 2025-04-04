import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Switch, Select, InputNumber,
  Tabs, Divider, Typography, message, Row, Col, Space, Upload
} from 'antd';
import {
  SaveOutlined, ReloadOutlined, UploadOutlined,
  SettingOutlined, SecurityScanOutlined, MailOutlined,
  CloudOutlined, FileOutlined, UserOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  emailSettings: {
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    senderEmail: string;
    senderName: string;
  };
  securitySettings: {
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUpperCase: boolean;
    loginMaxRetries: number;
    sessionTimeout: number;
    allowMultipleLogin: boolean;
  };
  storageSettings: {
    defaultStorageQuota: number;
    allowedFileTypes: string[];
    maxFileSize: number;
    enableCloudStorage: boolean;
    cloudProvider: string;
    cloudApiKey: string;
    cloudRegion: string;
  };
}

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [generalForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [storageForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/settings');
      
      // 设置表单初始值
      if (response) {
        generalForm.setFieldsValue({
          siteName: response.siteName,
          siteDescription: response.siteDescription,
          logo: response.logo,
          allowRegistration: response.allowRegistration,
          maintenanceMode: response.maintenanceMode
        });
        
        emailForm.setFieldsValue(response.emailSettings);
        securityForm.setFieldsValue(response.securitySettings);
        storageForm.setFieldsValue(response.storageSettings);
      } else {
        message.error('获取系统设置失败，使用默认设置');
        // 设置默认值
        setDefaultValues();
      }
    } catch (error) {
      console.error('获取系统设置失败:', error);
      message.error('获取系统设置失败，使用默认设置');
      // 设置默认值
      setDefaultValues();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultValues = () => {
    // 设置默认值
    generalForm.setFieldsValue({
      siteName: '在线学习平台',
      siteDescription: '一个现代化的在线学习系统',
      allowRegistration: true,
      maintenanceMode: false
    });
    
    emailForm.setFieldsValue({
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      senderEmail: 'noreply@example.com',
      senderName: '在线学习平台'
    });
    
    securityForm.setFieldsValue({
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      passwordRequireNumbers: true,
      passwordRequireUpperCase: true,
      loginMaxRetries: 5,
      sessionTimeout: 30,
      allowMultipleLogin: false
    });
    
    storageForm.setFieldsValue({
      defaultStorageQuota: 1024,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'],
      maxFileSize: 50,
      enableCloudStorage: false,
      cloudProvider: 'aws',
      cloudApiKey: '',
      cloudRegion: 'us-east-1'
    });
  };

  const handleSaveGeneral = async () => {
    try {
      const values = await generalForm.validateFields();
      setSaving(true);
      
      await apiService.put('/api/settings/general', values);
      message.success('常规设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const values = await emailForm.validateFields();
      setSaving(true);
      
      await apiService.put('/api/settings/email', values);
      message.success('邮件设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      const values = await securityForm.validateFields();
      setSaving(true);
      
      await apiService.put('/api/settings/security', values);
      message.success('安全设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStorage = async () => {
    try {
      const values = await storageForm.validateFields();
      setSaving(true);
      
      await apiService.put('/api/settings/storage', values);
      message.success('存储设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const values = await emailForm.validateFields();
      
      await apiService.post('/api/settings/email/test', values);
      message.success('测试邮件已发送');
    } catch (error) {
      console.error('测试邮件发送失败:', error);
      message.error('测试邮件发送失败');
    }
  };
  
  return (
    <div className="settings-page">
      <Card loading={loading}>
        <Title level={2}>系统设置</Title>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                常规设置
              </span>
            } 
            key="general"
          >
            <Form
              form={generalForm}
              layout="vertical"
              style={{ maxWidth: 800 }}
            >
              <Form.Item
                name="siteName"
                label="网站名称"
                rules={[{ required: true, message: '请输入网站名称' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="siteDescription"
                label="网站描述"
              >
                <TextArea rows={3} />
              </Form.Item>
              
              <Form.Item
                name="logo"
                label="网站Logo"
              >
                <Upload
                  name="logo"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    建议尺寸: 200x60px
                  </Text>
                </Upload>
              </Form.Item>
              
              <Form.Item
                name="allowRegistration"
                label="允许用户注册"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="maintenanceMode"
                label="维护模式"
                valuePropName="checked"
                extra="启用维护模式后，只有管理员可以访问系统"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveGeneral}
                    loading={saving}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => fetchSettings()}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <MailOutlined />
                邮件设置
              </span>
            } 
            key="email"
          >
            <Form
              form={emailForm}
              layout="vertical"
              style={{ maxWidth: 800 }}
            >
              <Form.Item
                name="smtpServer"
                label="SMTP服务器"
                rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="smtpPort"
                label="SMTP端口"
                rules={[{ required: true, message: '请输入SMTP端口' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="smtpUser"
                label="SMTP用户名"
                rules={[{ required: true, message: '请输入SMTP用户名' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="smtpPassword"
                label="SMTP密码"
                rules={[{ required: true, message: '请输入SMTP密码' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="senderEmail"
                label="发件人邮箱"
                rules={[
                  { required: true, message: '请输入发件人邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="senderName"
                label="发件人名称"
                rules={[{ required: true, message: '请输入发件人名称' }]}
              >
                <Input />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveEmail}
                    loading={saving}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<MailOutlined />} 
                    onClick={handleTestEmail}
                  >
                    发送测试邮件
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined />
                安全设置
              </span>
            } 
            key="security"
          >
            <Form
              form={securityForm}
              layout="vertical"
              style={{ maxWidth: 800 }}
            >
              <Title level={4}>密码设置</Title>
              
              <Form.Item
                name="passwordMinLength"
                label="密码最小长度"
                rules={[{ required: true, message: '请输入密码最小长度' }]}
              >
                <InputNumber min={6} max={32} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="passwordRequireSpecialChar"
                label="要求包含特殊字符"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="passwordRequireNumbers"
                label="要求包含数字"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="passwordRequireUpperCase"
                label="要求包含大写字母"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>登录设置</Title>
              
              <Form.Item
                name="loginMaxRetries"
                label="最大登录重试次数"
                rules={[{ required: true, message: '请输入最大登录重试次数' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="sessionTimeout"
                label="会话超时时间(分钟)"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="allowMultipleLogin"
                label="允许多处登录"
                valuePropName="checked"
                extra="是否允许同一账号在多个设备同时登录"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveSecurity}
                  loading={saving}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CloudOutlined />
                存储设置
              </span>
            } 
            key="storage"
          >
            <Form
              form={storageForm}
              layout="vertical"
              style={{ maxWidth: 800 }}
            >
              <Form.Item
                name="defaultStorageQuota"
                label="默认存储配额(MB)"
                rules={[{ required: true, message: '请输入默认存储配额' }]}
              >
                <InputNumber min={100} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="allowedFileTypes"
                label="允许上传的文件类型"
                rules={[{ required: true, message: '请选择允许上传的文件类型' }]}
              >
                <Select mode="tags" style={{ width: '100%' }} placeholder="输入文件扩展名，如jpg, pdf等">
                  <Option value="jpg">JPG图片</Option>
                  <Option value="png">PNG图片</Option>
                  <Option value="pdf">PDF文档</Option>
                  <Option value="doc">Word文档(DOC)</Option>
                  <Option value="docx">Word文档(DOCX)</Option>
                  <Option value="ppt">PowerPoint(PPT)</Option>
                  <Option value="pptx">PowerPoint(PPTX)</Option>
                  <Option value="xls">Excel(XLS)</Option>
                  <Option value="xlsx">Excel(XLSX)</Option>
                  <Option value="zip">ZIP压缩包</Option>
                  <Option value="mp4">MP4视频</Option>
                  <Option value="mp3">MP3音频</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="maxFileSize"
                label="最大文件大小(MB)"
                rules={[{ required: true, message: '请输入最大文件大小' }]}
              >
                <InputNumber min={1} max={500} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="enableCloudStorage"
                label="启用云存储"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.enableCloudStorage !== currentValues.enableCloudStorage
                }
              >
                {({ getFieldValue }) => 
                  getFieldValue('enableCloudStorage') ? (
                    <>
                      <Form.Item
                        name="cloudProvider"
                        label="云存储供应商"
                        rules={[{ required: true, message: '请选择云存储供应商' }]}
                      >
                        <Select>
                          <Option value="aws">Amazon S3</Option>
                          <Option value="azure">Microsoft Azure Blob</Option>
                          <Option value="gcp">Google Cloud Storage</Option>
                          <Option value="aliyun">阿里云OSS</Option>
                          <Option value="qiniu">七牛云</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="cloudApiKey"
                        label="API密钥"
                        rules={[{ required: true, message: '请输入API密钥' }]}
                      >
                        <Input.Password />
                      </Form.Item>
                      
                      <Form.Item
                        name="cloudRegion"
                        label="区域"
                        rules={[{ required: true, message: '请输入区域' }]}
                      >
                        <Input />
                      </Form.Item>
                    </>
                  ) : null
                }
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveStorage}
                  loading={saving}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings; 