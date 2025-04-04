import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Tag, 
  Tabs, 
  List, 
  Avatar, 
  message,
  Divider,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CommentOutlined,
  ExperimentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import { useAppContext } from '../contexts/AppContext';
import usePermission from '../hooks/usePermission';
import { TeacherGroup, TeacherGroupType } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// 模拟教研组数据
const mockResearchGroups: TeacherGroup[] = [
  {
    id: '1',
    name: '初中数学教研组',
    type: 'research',
    description: '专注于初中数学教育研究与教学方法创新',
    members: ['2', '3', '4'],
    leaderId: '2'
  },
  {
    id: '2',
    name: '高中物理教研组',
    type: 'research',
    description: '研究高中物理教学方法与实验教学',
    members: ['5', '6', '7'],
    leaderId: '5'
  },
  {
    id: '3',
    name: '英语教学研究组',
    type: 'research',
    description: '英语教学方法研究与课程开发',
    members: ['8', '9', '10'],
    leaderId: '8'
  }
];

// 模拟教师数据
const mockTeachers = [
  { id: '1', name: '张老师', avatar: null, department: '数学教研室' },
  { id: '2', name: '李老师', avatar: null, department: '数学教研室' },
  { id: '3', name: '王老师', avatar: null, department: '数学教研室' },
  { id: '4', name: '赵老师', avatar: null, department: '数学教研室' },
  { id: '5', name: '刘老师', avatar: null, department: '物理教研室' },
  { id: '6', name: '陈老师', avatar: null, department: '物理教研室' },
  { id: '7', name: '杨老师', avatar: null, department: '物理教研室' },
  { id: '8', name: '周老师', avatar: null, department: '英语教研室' },
  { id: '9', name: '吴老师', avatar: null, department: '英语教研室' },
  { id: '10', name: '郑老师', avatar: null, department: '英语教研室' },
];

// 模拟研究活动数据
const mockResearchActivities = [
  { 
    id: '1', 
    groupId: '1', 
    title: '初中数学教学难点突破研讨', 
    date: '2023-03-15', 
    description: '讨论初中数学教学中的常见难点和应对策略',
    participants: ['2', '3', '4'],
    status: 'completed',
    materials: [
      { id: '1', name: '初中数学难点分析.ppt' },
      { id: '2', name: '教学策略汇总.docx' }
    ]
  },
  { 
    id: '2', 
    groupId: '2', 
    title: '高中物理实验教学方法研讨', 
    date: '2023-03-20', 
    description: '探讨高中物理实验教学的创新方法',
    participants: ['5', '6', '7'],
    status: 'upcoming',
    materials: [
      { id: '3', name: '物理实验教学案例.ppt' },
      { id: '4', name: '实验教学反思.docx' }
    ]
  }
];

// 模拟学术讨论数据
const mockDiscussions = [
  {
    id: '1',
    groupId: '1',
    title: '如何提高学生的数学兴趣',
    initiator: '2',
    date: '2023-03-10',
    content: '数学学习兴趣是影响学生学习效果的重要因素，如何在教学中激发学生的学习兴趣？',
    replies: [
      { id: '1', author: '3', content: '可以通过生活中的实例引入数学概念，让学生感受数学的实用性。', date: '2023-03-11' },
      { id: '2', author: '4', content: '设计有趣的数学游戏和互动活动，让学生在活动中学习。', date: '2023-03-12' }
    ]
  }
];

const TeacherResearchGroup: React.FC = () => {
  const { user } = useAppContext();
  const { isTeacher, isAdmin } = usePermission();
  
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<TeacherGroup | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isDiscussionModalVisible, setIsDiscussionModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  
  const [form] = Form.useForm();
  const [activityForm] = Form.useForm();
  const [discussionForm] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [currentDiscussion, setCurrentDiscussion] = useState<any>(null);
  
  // 加载数据
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    setGroups(mockResearchGroups);
    setTeachers(mockTeachers);
    
    // 如果当前用户是教师，过滤出其所属的教研组
    if (user && user.role === 'teacher' && !isAdmin) {
      if (user.teacherGroups) {
        const researchGroups = user.teacherGroups.filter(group => group.type === 'research');
        if (researchGroups.length > 0) {
          setCurrentGroup(researchGroups[0]);
          loadGroupData(researchGroups[0].id);
        }
      }
    } else if (isAdmin) {
      // 管理员可以看到所有教研组
      if (mockResearchGroups.length > 0) {
        setCurrentGroup(mockResearchGroups[0]);
        loadGroupData(mockResearchGroups[0].id);
      }
    }
  }, [user, isAdmin]);
  
  // 加载教研组相关数据
  const loadGroupData = (groupId: string) => {
    // 加载研究活动
    const groupActivities = mockResearchActivities.filter(activity => activity.groupId === groupId);
    setActivities(groupActivities);
    
    // 加载学术讨论
    const groupDiscussions = mockDiscussions.filter(discussion => discussion.groupId === groupId);
    setDiscussions(groupDiscussions);
  };
  
  // 选择教研组
  const handleGroupSelect = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
      loadGroupData(groupId);
    }
  };
  
  // 打开创建教研组模态框
  const showCreateModal = () => {
    setModalType('create');
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // 打开编辑教研组模态框
  const showEditModal = (group: TeacherGroup) => {
    setModalType('edit');
    form.setFieldsValue({
      name: group.name,
      description: group.description,
      members: group.members,
      leaderId: group.leaderId
    });
    setCurrentGroup(group);
    setIsModalVisible(true);
  };
  
  // 处理教研组表单提交
  const handleGroupFormSubmit = () => {
    form.validateFields().then(values => {
      if (modalType === 'create') {
        // 创建新教研组
        const newGroup: TeacherGroup = {
          id: Date.now().toString(),
          name: values.name,
          type: 'research',
          description: values.description,
          members: values.members,
          leaderId: values.leaderId
        };
        setGroups([...groups, newGroup]);
        message.success('教研组创建成功！');
      } else if (modalType === 'edit' && currentGroup) {
        // 更新现有教研组
        const updatedGroups = groups.map(group => 
          group.id === currentGroup.id
            ? { ...group, name: values.name, description: values.description, members: values.members, leaderId: values.leaderId }
            : group
        );
        setGroups(updatedGroups);
        message.success('教研组更新成功！');
      }
      setIsModalVisible(false);
    });
  };
  
  // 删除教研组
  const handleDeleteGroup = (groupId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个教研组吗？这个操作不可逆。',
      onOk: () => {
        const updatedGroups = groups.filter(group => group.id !== groupId);
        setGroups(updatedGroups);
        if (currentGroup && currentGroup.id === groupId) {
          setCurrentGroup(updatedGroups[0] || null);
          if (updatedGroups[0]) {
            loadGroupData(updatedGroups[0].id);
          } else {
            setActivities([]);
            setDiscussions([]);
          }
        }
        message.success('教研组删除成功！');
      }
    });
  };
  
  // 打开创建研究活动模态框
  const showCreateActivityModal = () => {
    activityForm.resetFields();
    setIsActivityModalVisible(true);
  };
  
  // 处理研究活动表单提交
  const handleActivityFormSubmit = () => {
    activityForm.validateFields().then(values => {
      if (currentGroup) {
        const newActivity = {
          id: Date.now().toString(),
          groupId: currentGroup.id,
          title: values.title,
          date: values.date,
          description: values.description,
          participants: values.participants,
          status: 'upcoming',
          materials: []
        };
        setActivities([...activities, newActivity]);
        setIsActivityModalVisible(false);
        message.success('研究活动创建成功！');
      }
    });
  };
  
  // 打开创建学术讨论模态框
  const showCreateDiscussionModal = () => {
    discussionForm.resetFields();
    setIsDiscussionModalVisible(true);
  };
  
  // 处理学术讨论表单提交
  const handleDiscussionFormSubmit = () => {
    discussionForm.validateFields().then(values => {
      if (currentGroup && user) {
        const newDiscussion = {
          id: Date.now().toString(),
          groupId: currentGroup.id,
          title: values.title,
          initiator: user.id,
          date: new Date().toISOString().split('T')[0],
          content: values.content,
          replies: []
        };
        setDiscussions([...discussions, newDiscussion]);
        setIsDiscussionModalVisible(false);
        message.success('学术讨论创建成功！');
      }
    });
  };
  
  // 打开回复讨论模态框
  const showReplyModal = (discussion: any) => {
    setCurrentDiscussion(discussion);
    replyForm.resetFields();
    setIsReplyModalVisible(true);
  };
  
  // 处理回复讨论表单提交
  const handleReplyFormSubmit = () => {
    replyForm.validateFields().then(values => {
      if (currentDiscussion && user) {
        const newReply = {
          id: Date.now().toString(),
          author: user.id,
          content: values.content,
          date: new Date().toISOString().split('T')[0]
        };
        
        const updatedDiscussions = discussions.map(disc => 
          disc.id === currentDiscussion.id
            ? { ...disc, replies: [...disc.replies, newReply] }
            : disc
        );
        
        setDiscussions(updatedDiscussions);
        setIsReplyModalVisible(false);
        message.success('回复成功！');
      }
    });
  };
  
  // 获取教师名称
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : '未知教师';
  };
  
  // 渲染教研组列表
  const renderGroupList = () => {
    return (
      <Card 
        title="教研组列表" 
        extra={
          isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
              创建教研组
            </Button>
          )
        }
      >
        {groups.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={groups}
            renderItem={group => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => handleGroupSelect(group.id)}>查看详情</Button>,
                  isAdmin && <Button type="link" onClick={() => showEditModal(group)}><EditOutlined /></Button>,
                  isAdmin && <Button type="link" danger onClick={() => handleDeleteGroup(group.id)}><DeleteOutlined /></Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<TeamOutlined />} />}
                  title={<a onClick={() => handleGroupSelect(group.id)}>{group.name}</a>}
                  description={
                    <>
                      <Text>{group.description}</Text>
                      <br />
                      <Text type="secondary">组长: {getTeacherName(group.leaderId || '')}</Text>
                      <br />
                      <Text type="secondary">成员: {group.members?.length || 0}人</Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无教研组" />
        )}
      </Card>
    );
  };
  
  // 渲染教研组详情
  const renderGroupDetail = () => {
    if (!currentGroup) {
      return <Empty description="请选择一个教研组" />;
    }
    
    return (
      <Card title={`${currentGroup.name} - 详情`}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <Paragraph>
              <Text strong>教研组名称:</Text> {currentGroup.name}
            </Paragraph>
            <Paragraph>
              <Text strong>描述:</Text> {currentGroup.description}
            </Paragraph>
            <Paragraph>
              <Text strong>组长:</Text> {getTeacherName(currentGroup.leaderId || '')}
            </Paragraph>
            <Divider orientation="left">成员列表</Divider>
            <List
              itemLayout="horizontal"
              dataSource={currentGroup.members || []}
              renderItem={memberId => {
                const teacher = teachers.find(t => t.id === memberId);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={teacher ? teacher.name : '未知教师'}
                      description={teacher ? teacher.department : ''}
                    />
                  </List.Item>
                );
              }}
            />
          </TabPane>
          
          <TabPane tab="研究活动" key="2">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              {(isAdmin || (user && currentGroup.leaderId === user.id)) && (
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateActivityModal}>
                  创建研究活动
                </Button>
              )}
            </div>
            
            {activities.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={activities}
                renderItem={activity => (
                  <List.Item
                    extra={
                      <Tag color={activity.status === 'upcoming' ? 'blue' : 'green'}>
                        {activity.status === 'upcoming' ? '即将开始' : '已完成'}
                      </Tag>
                    }
                  >
                    <List.Item.Meta
                      title={activity.title}
                      description={`日期: ${activity.date}`}
                    />
                    <Paragraph>{activity.description}</Paragraph>
                    <div>
                      <Text strong>参与者: </Text>
                      {activity.participants.map((pid: string) => (
                        <Tag key={pid}>{getTeacherName(pid)}</Tag>
                      ))}
                    </div>
                    
                    {activity.materials && activity.materials.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>相关材料: </Text>
                        <List
                          dataSource={activity.materials}
                          renderItem={(material: any) => (
                            <List.Item style={{ paddingTop: 4, paddingBottom: 4 }}>
                              <FileTextOutlined /> {material.name}
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无研究活动" />
            )}
          </TabPane>
          
          <TabPane tab="学术讨论" key="3">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              {(isAdmin || currentGroup.members?.includes(user?.id || '')) && (
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateDiscussionModal}>
                  发起讨论
                </Button>
              )}
            </div>
            
            {discussions.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={discussions}
                renderItem={discussion => (
                  <List.Item>
                    <List.Item.Meta
                      title={discussion.title}
                      description={
                        <>
                          <Text type="secondary">发起人: {getTeacherName(discussion.initiator)}</Text>
                          <Text type="secondary" style={{ marginLeft: 8 }}>日期: {discussion.date}</Text>
                        </>
                      }
                    />
                    <Paragraph>{discussion.content}</Paragraph>
                    
                    <div style={{ background: '#f9f9f9', padding: 16, marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>回复 ({discussion.replies?.length || 0})</Text>
                        {(isAdmin || currentGroup.members?.includes(user?.id || '')) && (
                          <Button type="link" onClick={() => showReplyModal(discussion)}>
                            回复
                          </Button>
                        )}
                      </div>
                      
                      {discussion.replies && discussion.replies.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={discussion.replies}
                          renderItem={(reply: any) => (
                            <List.Item style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={`${getTeacherName(reply.author)} 于 ${reply.date}`}
                                description={reply.content}
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="暂无回复" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无学术讨论" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    );
  };
  
  return (
    <div className="teacher-research-group-page">
      <Title level={2}>
        <ExperimentOutlined /> 教师教研组
      </Title>
      <Paragraph>
        教研组是教师专业成长和教学研究的重要平台，可以进行教学研讨、集体备课和学术交流。
      </Paragraph>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '30%' }}>
          {renderGroupList()}
        </div>
        <div style={{ width: '70%' }}>
          {renderGroupDetail()}
        </div>
      </div>
      
      {/* 教研组表单模态框 */}
      <Modal
        title={modalType === 'create' ? '创建教研组' : '编辑教研组'}
        visible={isModalVisible}
        onOk={handleGroupFormSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="教研组名称"
            rules={[{ required: true, message: '请输入教研组名称!' }]}
          >
            <Input placeholder="请输入教研组名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="教研组描述"
            rules={[{ required: true, message: '请输入教研组描述!' }]}
          >
            <TextArea rows={4} placeholder="请输入教研组描述" />
          </Form.Item>
          
          <Form.Item
            name="members"
            label="成员"
            rules={[{ required: true, message: '请选择成员!' }]}
          >
            <Select mode="multiple" placeholder="请选择成员">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="leaderId"
            label="组长"
            rules={[{ required: true, message: '请选择组长!' }]}
          >
            <Select placeholder="请选择组长">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 研究活动表单模态框 */}
      <Modal
        title="创建研究活动"
        visible={isActivityModalVisible}
        onOk={handleActivityFormSubmit}
        onCancel={() => setIsActivityModalVisible(false)}
        width={600}
      >
        <Form form={activityForm} layout="vertical">
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题!' }]}
          >
            <Input placeholder="请输入活动标题" />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="活动日期"
            rules={[{ required: true, message: '请输入活动日期!' }]}
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述!' }]}
          >
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
          
          <Form.Item
            name="participants"
            label="参与者"
            rules={[{ required: true, message: '请选择参与者!' }]}
          >
            <Select mode="multiple" placeholder="请选择参与者">
              {currentGroup?.members?.map(memberId => {
                const teacher = teachers.find(t => t.id === memberId);
                return (
                  <Option key={memberId} value={memberId}>{teacher ? teacher.name : '未知教师'}</Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 学术讨论表单模态框 */}
      <Modal
        title="发起学术讨论"
        visible={isDiscussionModalVisible}
        onOk={handleDiscussionFormSubmit}
        onCancel={() => setIsDiscussionModalVisible(false)}
        width={600}
      >
        <Form form={discussionForm} layout="vertical">
          <Form.Item
            name="title"
            label="讨论主题"
            rules={[{ required: true, message: '请输入讨论主题!' }]}
          >
            <Input placeholder="请输入讨论主题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="讨论内容"
            rules={[{ required: true, message: '请输入讨论内容!' }]}
          >
            <TextArea rows={4} placeholder="请输入讨论内容" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 回复讨论表单模态框 */}
      <Modal
        title="回复讨论"
        visible={isReplyModalVisible}
        onOk={handleReplyFormSubmit}
        onCancel={() => setIsReplyModalVisible(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>主题: </Text>
          <Text>{currentDiscussion?.title}</Text>
        </div>
        
        <Form form={replyForm} layout="vertical">
          <Form.Item
            name="content"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容!' }]}
          >
            <TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherResearchGroup; 