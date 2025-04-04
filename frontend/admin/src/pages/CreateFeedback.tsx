import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Radio,
  message,
  Typography,
  Divider,
  Space,
  Alert
} from 'antd';
import { 
  CommentOutlined, 
  SendOutlined, 
  BookOutlined, 
  FileOutlined, 
  BulbOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import * as feedbackService from '../services/feedbackService';
import * as courseService from '../services/courseService';
import * as materialService from '../services/materialService';
import * as userService from '../services/userService';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackTypes, setFeedbackTypes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  
  useEffect(() => {
    loadFeedbackTypes();
    loadCourses();
    loadTeachers();
  }, []);
  
  // 当课程选择变化时，加载该课程的素材
  useEffect(() => {
    if (selectedCourse) {
      loadMaterialsByCourse(selectedCourse);
    } else {
      setMaterials([]);
    }
  }, [selectedCourse]);

  // 加载反馈类型
  const loadFeedbackTypes = async () => {
    try {
      const types = await feedbackService.getFeedbackTypes();
      setFeedbackTypes(types);
    } catch (error) {
      message.error('加载反馈类型失败');
      console.error(error);
    }
  };

  // 加载学生的课程
  const loadCourses = async () => {
    try {
      const response = await courseService.getStudentCourses();
      setCourses(response.map((course: any) => ({
        label: course.title,
        value: course.id
      })));
    } catch (error) {
      message.error('加载课程失败');
      console.error(error);
    }
  };

  // 根据课程加载素材
  const loadMaterialsByCourse = async (courseId: number) => {
    try {
      const response = await materialService.getMaterialsByCourse(courseId);
      setMaterials(response.map((material: any) => ({
        label: material.title,
        value: material.id
      })));
    } catch (error) {
      message.error('加载课程素材失败');
      console.error(error);
    }
  };

  // 加载教师列表
  const loadTeachers = async () => {
    try {
      const response = await userService.getTeachers();
      setTeachers(response.map((teacher: any) => ({
        label: teacher.displayName || `${teacher.firstName} ${teacher.lastName}`,
        value: teacher.id
      })));
    } catch (error) {
      message.error('加载教师列表失败');
      console.error(error);
    }
  };

  // 提交反馈
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const createDto: feedbackService.CreateFeedbackDTO = {
        title: values.title,
        content: values.content,
        feedbackType: values.feedbackType,
        priority: values.priority || 'Normal',
        courseId: values.courseId,
        materialId: values.materialId,
        assignToTeacherId: values.assignToTeacherId,
        generateRecommendations: true
      };

      await feedbackService.createFeedback(createDto);
      message.success('反馈提交成功');
      
      // 重置表单
      form.resetFields();
      
      // 跳转到我的反馈列表
      navigate('/my-feedback');
    } catch (error) {
      message.error('反馈提交失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="提交反馈"
        subtitle="提交您在学习过程中遇到的问题或建议，我们会尽快回复"
        icon={<CommentOutlined />}
      />

      <Card>
        <Alert
          message="提交反馈指南"
          description="请尽可能详细地描述您遇到的问题，包括相关的课程、学习资料或具体章节。这将帮助我们更快地解决您的问题。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'Normal',
            feedbackType: 'LearningQuestion'
          }}
        >
          <Form.Item
            name="title"
            label="反馈标题"
            rules={[{ required: true, message: '请输入反馈标题' }]}
          >
            <Input placeholder="简要描述您的问题或建议" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="content"
            label="详细描述"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea
              placeholder="请详细描述您遇到的问题或建议..."
              rows={6}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="feedbackType"
            label="反馈类型"
            rules={[{ required: true, message: '请选择反馈类型' }]}
          >
            <Select placeholder="选择反馈类型">
              {feedbackTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="优先级">
            <Radio.Group>
              <Radio value="Low">低</Radio>
              <Radio value="Normal">中</Radio>
              <Radio value="High">高</Radio>
              <Radio value="Urgent">紧急</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider dashed />
          <Paragraph type="secondary">关联信息（可选）</Paragraph>

          <Form.Item name="courseId" label="相关课程">
            <Select 
              placeholder="选择相关课程" 
              allowClear
              onChange={(value) => setSelectedCourse(value)}
            >
              {courses.map(course => (
                <Option key={course.value} value={course.value}>
                  {course.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="materialId" label="相关学习材料">
            <Select 
              placeholder="选择相关学习材料" 
              allowClear 
              disabled={!selectedCourse}
            >
              {materials.map(material => (
                <Option key={material.value} value={material.value}>
                  {material.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="assignToTeacherId" label="指定教师回复">
            <Select placeholder="选择教师（可选）" allowClear>
              {teachers.map(teacher => (
                <Option key={teacher.value} value={teacher.value}>
                  {teacher.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
              >
                提交反馈
              </Button>
              <Button 
                onClick={() => navigate('/my-feedback')}
              >
                返回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateFeedback; 