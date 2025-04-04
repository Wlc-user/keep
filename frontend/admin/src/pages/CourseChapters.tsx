import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, List, Space, Typography, Modal, Form, Input, InputNumber, message, Collapse, Tooltip, Spin, Empty, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, ArrowUpOutlined, ArrowDownOutlined, FileOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import PageHeader from '../components/PageHeader';
import './CourseChapters.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface Course {
  id: number;
  title: string;
  shortDescription: string;
}

interface CourseChapter {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
}

interface CourseLesson {
  id: number;
  chapterId: number;
  title: string;
  description: string;
  contentType: string;
  duration: number;
  orderIndex: number;
  isPublished: boolean;
}

const CourseChapters: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [lessons, setLessons] = useState<{ [key: number]: CourseLesson[] }>({});
  const [loading, setLoading] = useState(true);
  
  // 模态框状态
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  
  // 表单实例
  const [chapterForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  
  // 获取课程、章节、课时数据
  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);
  
  const fetchCourseData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseId = parseInt(id);
      
      // 获取课程信息
      const courseData = await apiService.courses.getById(courseId);
      setCourse(courseData);
      
      // 获取章节信息
      const chaptersData = await apiService.courses.getChapters(courseId);
      
      if (chaptersData && chaptersData.length > 0) {
        // 按照排序顺序排列章节
        const sortedChapters = chaptersData.sort((a, b) => a.orderIndex - b.orderIndex);
        setChapters(sortedChapters);
        
        // 对每个章节获取课时信息
        const lessonsMap: { [key: number]: CourseLesson[] } = {};
        
        for (const chapter of sortedChapters) {
          const chapterLessons = await apiService.courses.getLessons(chapter.id);
          if (chapterLessons) {
            // 按照排序顺序排列课时
            lessonsMap[chapter.id] = chapterLessons.sort((a, b) => a.orderIndex - b.orderIndex);
          } else {
            lessonsMap[chapter.id] = [];
          }
        }
        
        setLessons(lessonsMap);
      }
    } catch (error) {
      console.error('获取课程数据失败:', error);
      message.error('获取课程数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 章节管理
  const showChapterModal = (chapter?: CourseChapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      chapterForm.setFieldsValue({
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex
      });
    } else {
      setEditingChapter(null);
      // 设置默认排序为当前章节数+1
      chapterForm.setFieldsValue({
        title: '',
        description: '',
        orderIndex: chapters.length + 1
      });
    }
    
    setChapterModalVisible(true);
  };
  
  const handleChapterSubmit = async () => {
    try {
      const values = await chapterForm.validateFields();
      
      if (!id) return;
      const courseId = parseInt(id);
      
      const chapterData = {
        ...values,
        courseId
      };
      
      if (editingChapter) {
        // 更新章节
        await apiService.courses.updateChapter(editingChapter.id, chapterData);
        message.success('章节更新成功');
      } else {
        // 创建章节
        await apiService.courses.createChapter(chapterData);
        message.success('章节创建成功');
      }
      
      // 重新获取数据
      fetchCourseData();
      
      // 关闭模态框
      setChapterModalVisible(false);
      chapterForm.resetFields();
    } catch (error) {
      console.error('保存章节失败:', error);
      message.error('保存章节失败');
    }
  };
  
  const handleDeleteChapter = async (chapterId: number) => {
    try {
      await apiService.courses.deleteChapter(chapterId);
      message.success('章节删除成功');
      
      // 更新本地数据
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
      
      // 删除对应的课时数据
      const updatedLessons = { ...lessons };
      delete updatedLessons[chapterId];
      setLessons(updatedLessons);
    } catch (error) {
      console.error('删除章节失败:', error);
      message.error('删除章节失败');
    }
  };
  
  const handleMoveChapter = async (chapterId: number, direction: 'up' | 'down') => {
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) return;
    
    // 边界检查
    if (direction === 'up' && chapterIndex === 0) return;
    if (direction === 'down' && chapterIndex === chapters.length - 1) return;
    
    const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    const targetChapter = chapters[newIndex];
    
    // 交换两个章节的顺序
    try {
      // 更新当前章节的顺序
      await apiService.courses.updateChapter(chapterId, { 
        orderIndex: targetChapter.orderIndex 
      });
      
      // 更新目标章节的顺序
      await apiService.courses.updateChapter(targetChapter.id, { 
        orderIndex: chapters[chapterIndex].orderIndex 
      });
      
      message.success('章节顺序已调整');
      fetchCourseData();
    } catch (error) {
      console.error('调整章节顺序失败:', error);
      message.error('调整章节顺序失败');
    }
  };
  
  // 课时管理
  const showLessonModal = (chapterId: number, lesson?: CourseLesson) => {
    setCurrentChapterId(chapterId);
    
    if (lesson) {
      setEditingLesson(lesson);
      lessonForm.setFieldsValue({
        title: lesson.title,
        description: lesson.description,
        contentType: lesson.contentType,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isPublished: lesson.isPublished
      });
    } else {
      setEditingLesson(null);
      
      // 获取当前章节的课时数
      const chapterLessons = lessons[chapterId] || [];
      
      lessonForm.setFieldsValue({
        title: '',
        description: '',
        contentType: 'video',
        duration: 0,
        orderIndex: chapterLessons.length + 1,
        isPublished: false
      });
    }
    
    setLessonModalVisible(true);
  };
  
  const handleLessonSubmit = async () => {
    try {
      const values = await lessonForm.validateFields();
      
      if (!currentChapterId) return;
      
      const lessonData = {
        ...values,
        chapterId: currentChapterId
      };
      
      if (editingLesson) {
        // 更新课时
        await apiService.courses.updateLesson(editingLesson.id, lessonData);
        message.success('课时更新成功');
      } else {
        // 创建课时
        await apiService.courses.createLesson(lessonData);
        message.success('课时创建成功');
      }
      
      // 重新获取数据
      fetchCourseData();
      
      // 关闭模态框
      setLessonModalVisible(false);
      lessonForm.resetFields();
    } catch (error) {
      console.error('保存课时失败:', error);
      message.error('保存课时失败');
    }
  };
  
  const handleDeleteLesson = async (lessonId: number, chapterId: number) => {
    try {
      await apiService.courses.deleteLesson(lessonId);
      message.success('课时删除成功');
      
      // 更新本地数据
      const updatedLessons = { ...lessons };
      if (updatedLessons[chapterId]) {
        updatedLessons[chapterId] = updatedLessons[chapterId].filter(
          lesson => lesson.id !== lessonId
        );
        setLessons(updatedLessons);
      }
    } catch (error) {
      console.error('删除课时失败:', error);
      message.error('删除课时失败');
    }
  };
  
  const handleMoveLesson = async (lessonId: number, chapterId: number, direction: 'up' | 'down') => {
    const chapterLessons = lessons[chapterId] || [];
    const lessonIndex = chapterLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;
    
    // 边界检查
    if (direction === 'up' && lessonIndex === 0) return;
    if (direction === 'down' && lessonIndex === chapterLessons.length - 1) return;
    
    const newIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    const targetLesson = chapterLessons[newIndex];
    
    // 交换两个课时的顺序
    try {
      // 更新当前课时的顺序
      await apiService.courses.updateLesson(lessonId, {
        orderIndex: targetLesson.orderIndex
      });
      
      // 更新目标课时的顺序
      await apiService.courses.updateLesson(targetLesson.id, {
        orderIndex: chapterLessons[lessonIndex].orderIndex
      });
      
      message.success('课时顺序已调整');
      fetchCourseData();
    } catch (error) {
      console.error('调整课时顺序失败:', error);
      message.error('调整课时顺序失败');
    }
  };
  
  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'video': return '视频';
      case 'audio': return '音频';
      case 'text': return '文本';
      case 'quiz': return '测验';
      default: return type;
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>正在加载课程结构...</p>
      </div>
    );
  }
  
  return (
    <div className="course-chapters-container">
      <PageHeader 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/courses/${id}`)}
              type="text"
            />
            {course ? `课程结构: ${course.title}` : '课程结构'}
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showChapterModal()}
          >
            添加章节
          </Button>
        }
      />
      
      <Card>
        {chapters.length === 0 ? (
          <Empty 
            description="课程暂无章节内容" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showChapterModal()}
            >
              添加第一个章节
            </Button>
          </Empty>
        ) : (
          <Collapse defaultActiveKey={chapters.length > 0 ? [chapters[0].id.toString()] : []}>
            {chapters.map((chapter, index) => (
              <Panel 
                key={chapter.id.toString()} 
                header={
                  <div className="chapter-header">
                    <Text strong>{`第${index + 1}章：${chapter.title}`}</Text>
                    <div className="chapter-actions" onClick={e => e.stopPropagation()}>
                      <Space>
                        <Tooltip title="上移">
                          <Button 
                            type="text" 
                            icon={<ArrowUpOutlined />} 
                            disabled={index === 0}
                            onClick={() => handleMoveChapter(chapter.id, 'up')}
                          />
                        </Tooltip>
                        <Tooltip title="下移">
                          <Button 
                            type="text" 
                            icon={<ArrowDownOutlined />} 
                            disabled={index === chapters.length - 1}
                            onClick={() => handleMoveChapter(chapter.id, 'down')}
                          />
                        </Tooltip>
                        <Tooltip title="编辑">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => showChapterModal(chapter)}
                          />
                        </Tooltip>
                        <Tooltip title="删除">
                          <Popconfirm
                            title="确定要删除这个章节吗？"
                            description="删除章节将同时删除其包含的所有课时"
                            onConfirm={() => handleDeleteChapter(chapter.id)}
                            okText="删除"
                            cancelText="取消"
                          >
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                            />
                          </Popconfirm>
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                }
              >
                <div className="chapter-content">
                  <Paragraph type="secondary">{chapter.description}</Paragraph>
                  
                  <List
                    className="lessons-list"
                    itemLayout="horizontal"
                    dataSource={lessons[chapter.id] || []}
                    locale={{ emptyText: '暂无课时' }}
                    renderItem={(lesson, lessonIndex) => (
                      <List.Item
                        actions={[
                          <Space>
                            <Tooltip title="上移">
                              <Button 
                                type="text" 
                                icon={<ArrowUpOutlined />} 
                                disabled={lessonIndex === 0}
                                onClick={() => handleMoveLesson(lesson.id, chapter.id, 'up')}
                              />
                            </Tooltip>
                            <Tooltip title="下移">
                              <Button 
                                type="text" 
                                icon={<ArrowDownOutlined />} 
                                disabled={lessonIndex === (lessons[chapter.id]?.length || 0) - 1}
                                onClick={() => handleMoveLesson(lesson.id, chapter.id, 'down')}
                              />
                            </Tooltip>
                            <Tooltip title="编辑">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                onClick={() => showLessonModal(chapter.id, lesson)}
                              />
                            </Tooltip>
                            <Tooltip title="删除">
                              <Popconfirm
                                title="确定要删除这个课时吗？"
                                onConfirm={() => handleDeleteLesson(lesson.id, chapter.id)}
                                okText="删除"
                                cancelText="取消"
                              >
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                />
                              </Popconfirm>
                            </Tooltip>
                          </Space>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<FileOutlined style={{ fontSize: 20 }} />}
                          title={`${lessonIndex + 1}. ${lesson.title}`}
                          description={
                            <Space direction="vertical">
                              <Text type="secondary">{lesson.description}</Text>
                              <Space>
                                <Text type="secondary">类型: {getContentTypeText(lesson.contentType)}</Text>
                                {lesson.duration > 0 && (
                                  <Text type="secondary">时长: {lesson.duration} 分钟</Text>
                                )}
                                {!lesson.isPublished && (
                                  <Text type="secondary" style={{ color: '#faad14' }}>未发布</Text>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                    footer={
                      <div className="add-lesson-container">
                        <Button 
                          type="dashed" 
                          icon={<PlusOutlined />} 
                          block
                          onClick={() => showLessonModal(chapter.id)}
                        >
                          添加课时
                        </Button>
                      </div>
                    }
                  />
                </div>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>
      
      {/* 章节编辑模态框 */}
      <Modal
        title={editingChapter ? '编辑章节' : '添加章节'}
        open={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        onOk={handleChapterSubmit}
        okText={editingChapter ? '保存' : '添加'}
        cancelText="取消"
      >
        <Form
          form={chapterForm}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="章节标题"
            rules={[{ required: true, message: '请输入章节标题' }]}
          >
            <Input placeholder="请输入章节标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="章节描述"
            rules={[{ required: true, message: '请输入章节描述' }]}
          >
            <TextArea rows={3} placeholder="请输入章节描述" />
          </Form.Item>
          
          <Form.Item
            name="orderIndex"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 课时编辑模态框 */}
      <Modal
        title={editingLesson ? '编辑课时' : '添加课时'}
        open={lessonModalVisible}
        onCancel={() => setLessonModalVisible(false)}
        onOk={handleLessonSubmit}
        okText={editingLesson ? '保存' : '添加'}
        cancelText="取消"
        width={700}
      >
        <Form
          form={lessonForm}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="课时标题"
            rules={[{ required: true, message: '请输入课时标题' }]}
          >
            <Input placeholder="请输入课时标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="课时描述"
            rules={[{ required: true, message: '请输入课时描述' }]}
          >
            <TextArea rows={3} placeholder="请输入课时描述" />
          </Form.Item>
          
          <Form.Item
            name="contentType"
            label="内容类型"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Input.Group compact>
              <Form.Item
                name="contentType"
                noStyle
              >
                <Input.Group compact>
                  <Form.Item name="contentType" noStyle>
                    <Input.Select style={{ width: '100%' }}>
                      <Input.Select.Option value="video">视频</Input.Select.Option>
                      <Input.Select.Option value="audio">音频</Input.Select.Option>
                      <Input.Select.Option value="text">文本</Input.Select.Option>
                      <Input.Select.Option value="quiz">测验</Input.Select.Option>
                    </Input.Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Input.Group>
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="时长（分钟）"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="orderIndex"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="isPublished"
            label="是否发布"
            valuePropName="checked"
          >
            <Input type="checkbox" /> 发布课时（未发布的课时只有教师和管理员可见）
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseChapters; 