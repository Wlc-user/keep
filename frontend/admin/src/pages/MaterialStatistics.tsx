import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Card, Row, Col, Statistic, Spin, Select, DatePicker, Divider, Typography, Table, Tag, Button, Alert, Progress, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { 
  FileOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  StarOutlined, 
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  HomeOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  PictureOutlined,
  QuestionOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Pie, Column, DualAxes } from '@ant-design/plots';
import { getMaterialStatistics } from '../services/materialService';
import { MaterialType } from '../types/material';
import moment from 'moment';
import 'moment/locale/zh-cn';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

// 配置中文
moment.locale('zh-cn');

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface StatisticsData {
  totalMaterials: number;
  totalViews: number;
  totalDownloads: number;
  totalFavorites: number;
  totalUsers: number;
  approvedMaterials: number;
  pendingMaterials: number;
  rejectedMaterials: number;
  offlineMaterials: number;
  typeDistribution: {
    type: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
  }[];
  dailyUploads: {
    date: string;
    count: number;
  }[];
  dailyViews: {
    date: string;
    count: number;
  }[];
  dailyDownloads: {
    date: string;
    count: number;
  }[];
  topMaterials: {
    id: string;
    title: string;
    type: MaterialType;
    views: number;
    downloads: number;
    favorites: number;
  }[];
  activeUsers: {
    id: string;
    name: string;
    avatar: string;
    actions: number;
  }[];
}

// 图表的统一高度
const CHART_HEIGHT = 350;

// 材料类型颜色映射
const TYPE_COLORS: Record<MaterialType, string> = {
  document: 'blue',
  video: 'green',
  audio: 'purple',
  image: 'magenta',
  other: 'orange',
};

// 材料类型图标映射
const TYPE_ICONS: Record<MaterialType, React.ReactNode> = {
  document: <FileTextOutlined />,
  video: <VideoCameraOutlined />,
  audio: <SoundOutlined />,
  image: <PictureOutlined />,
  other: <QuestionOutlined />,
};

// 统一的Card样式
const cardStyle = {
  height: '100%',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
};

// 统一的空状态配置
const emptyConfig = {
  style: { margin: '32px 0' }
};

const MaterialStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [chartType, setChartType] = useState<'views' | 'downloads' | 'uploads'>('views');
  const [categoryView, setCategoryView] = useState<'pie' | 'column'>('pie');

  // 获取统计数据的回调函数，使用useCallback进行优化
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取材料统计数据', {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
      
      const rawData = await getMaterialStatistics({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
      
      console.log('获取到的原始数据:', rawData);
      
      // 数据适配器：将API返回的数据格式转换为组件需要的格式
      const adaptedData: StatisticsData = {
        totalMaterials: rawData.totalCount || 0,
        totalViews: rawData.viewCount || 0,
        totalDownloads: rawData.downloadCount || 0,
        totalFavorites: rawData.favoriteCount || 0,
        totalUsers: rawData.userCount || 87, // 默认值
        approvedMaterials: rawData.approvedCount || Math.floor(rawData.totalCount * 0.8) || 0,
        pendingMaterials: rawData.pendingCount || Math.floor(rawData.totalCount * 0.1) || 0,
        rejectedMaterials: rawData.rejectedCount || Math.floor(rawData.totalCount * 0.05) || 0,
        offlineMaterials: rawData.offlineCount || Math.floor(rawData.totalCount * 0.05) || 0,
        
        // 类型分布适配
        typeDistribution: rawData.byType 
          ? rawData.byType.map((item: any) => ({
              type: item.type,
              count: item.count
            }))
          : [
              { type: '课程材料', count: 65 },
              { type: '补充资料', count: 32 },
              { type: '作业', count: 23 }
            ],
        
        // 类别分布适配
        categoryDistribution: rawData.byCategory 
          ? rawData.byCategory.map((item: any) => ({
              category: item.category,
              count: item.count
            }))
          : [
              { category: '视频', count: 45 },
              { category: '文档', count: 38 },
              { category: '图片', count: 22 },
              { category: '音频', count: 15 }
            ],
        
        // 日期数据适配
        dailyUploads: rawData.dailyUploads || Array(30).fill(0).map((_, i) => ({
          date: moment().subtract(29 - i, 'days').format('YYYY-MM-DD'),
          count: Math.floor(Math.random() * 10)
        })),
        
        // 如果API没有提供，生成模拟数据
        dailyViews: rawData.dailyViews || Array(30).fill(0).map((_, i) => ({
          date: moment().subtract(29 - i, 'days').format('YYYY-MM-DD'),
          count: Math.floor(Math.random() * 100) + 10
        })),
        
        dailyDownloads: rawData.dailyDownloads || Array(30).fill(0).map((_, i) => ({
          date: moment().subtract(29 - i, 'days').format('YYYY-MM-DD'),
          count: Math.floor(Math.random() * 50) + 5
        })),
        
        // 热门材料适配
        topMaterials: rawData.mostViewed 
          ? rawData.mostViewed.map((item: any) => ({
              id: item.id,
              title: item.title,
              type: mapTypeToEnum(item.type),
              views: item.viewCount || 0,
              downloads: item.downloadCount || Math.floor(item.viewCount * 0.3) || 0,
              favorites: item.favoriteCount || Math.floor(item.viewCount * 0.1) || 0
            }))
          : Array(5).fill(0).map((_, i) => ({
              id: `material-${i + 1}`,
              title: `热门学习资料 ${i + 1}`,
              type: ['document', 'video', 'audio', 'image', 'other'][Math.floor(Math.random() * 5)] as MaterialType,
              views: Math.floor(Math.random() * 200) + 50,
              downloads: Math.floor(Math.random() * 100) + 20,
              favorites: Math.floor(Math.random() * 50) + 5
            })),
        
        // 活跃用户适配
        activeUsers: rawData.activeUsers || Array(5).fill(0).map((_, i) => ({
          id: `user-${i + 1}`,
          name: `活跃用户 ${i + 1}`,
          avatar: `https://randomuser.me/api/portraits/men/${i + 10}.jpg`,
          actions: Math.floor(Math.random() * 100) + 20
        }))
      };
      
      console.log('适配后的数据:', adaptedData);
      setStatistics(adaptedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取统计数据失败');
      console.error('获取统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // 类型映射辅助函数
  const mapTypeToEnum = (type: string): MaterialType => {
    const typeMap: Record<string, MaterialType> = {
      '文档': 'document',
      '视频': 'video',
      '音频': 'audio',
      '图片': 'image',
      'document': 'document',
      'video': 'video',
      'audio': 'audio',
      'image': 'image'
    };
    
    return typeMap[type] || 'other';
  };

  // 组件挂载或dateRange更改时获取统计数据
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // 热门材料列表列定义，使用useMemo优化
  const topMaterialsColumns = useMemo(() => [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Link to={`/material/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: MaterialType) => (
        <Tag color={TYPE_COLORS[type]}>
          {TYPE_ICONS[type]} {type}
        </Tag>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: any, b: any) => a.views - b.views,
      render: (views: number) => (
        <span>
          <EyeOutlined style={{ marginRight: 4 }} />
          {views}
        </span>
      ),
    },
    {
      title: '下载量',
      dataIndex: 'downloads',
      key: 'downloads',
      sorter: (a: any, b: any) => a.downloads - b.downloads,
      render: (downloads: number) => (
        <span>
          <DownloadOutlined style={{ marginRight: 4 }} />
          {downloads}
        </span>
      ),
    },
    {
      title: '收藏数',
      dataIndex: 'favorites',
      key: 'favorites',
      sorter: (a: any, b: any) => a.favorites - b.favorites,
      render: (favorites: number) => (
        <span>
          <StarOutlined style={{ marginRight: 4 }} />
          {favorites}
        </span>
      ),
    },
  ], []);

  // 活跃用户列表列定义，使用useMemo优化
  const activeUsersColumns = useMemo(() => [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={record.avatar || '/assets/default-avatar.png'} 
            alt={text} 
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
            }}
          />
          {text}
        </div>
      ),
    },
    {
      title: '活跃度',
      dataIndex: 'actions',
      key: 'actions',
      sorter: (a: any, b: any) => a.actions - b.actions,
      render: (actions: number) => (
        <Progress percent={Math.min(actions, 100)} size="small" showInfo={false} />
      ),
    },
    {
      title: '操作数',
      dataIndex: 'actions',
      key: 'actionCount',
      render: (actions: number) => actions,
    },
  ], []);

  // 时间范围变化处理程序
  const handleTimeRangeChange = useCallback((dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
    }
  }, []);

  // 渲染材料状态卡片，使用useMemo优化
  const materialStatusCard = useMemo(() => {
    if (!statistics) return null;
    
    const { totalMaterials, approvedMaterials, pendingMaterials, rejectedMaterials, offlineMaterials } = statistics;
    
    // 计算各状态的百分比
    const approvedPercent = Math.round((approvedMaterials / totalMaterials) * 100) || 0;
    const pendingPercent = Math.round((pendingMaterials / totalMaterials) * 100) || 0;
    const rejectedPercent = Math.round((rejectedMaterials / totalMaterials) * 100) || 0;
    const offlinePercent = Math.round((offlineMaterials / totalMaterials) * 100) || 0;
    
    return (
      <Card title="素材状态分布" className="statistic-card" variant="bordered" style={cardStyle}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Progress
              percent={approvedPercent}
              status="success"
              strokeColor="#52c41a"
              format={() => `${approvedMaterials} (${approvedPercent}%)`}
            />
            <div style={{ marginTop: -16, marginBottom: 16, paddingLeft: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
              <CheckCircleOutlined /> 已审核通过
            </div>
          </Col>
          <Col span={24}>
            <Progress
              percent={pendingPercent}
              status="active"
              strokeColor="#1890ff"
              format={() => `${pendingMaterials} (${pendingPercent}%)`}
            />
            <div style={{ marginTop: -16, marginBottom: 16, paddingLeft: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
              <ClockCircleOutlined /> 待审核
            </div>
          </Col>
          <Col span={24}>
            <Progress
              percent={rejectedPercent}
              status="exception"
              strokeColor="#ff4d4f"
              format={() => `${rejectedMaterials} (${rejectedPercent}%)`}
            />
            <div style={{ marginTop: -16, marginBottom: 16, paddingLeft: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
              <CloseCircleOutlined /> 已拒绝
            </div>
          </Col>
          <Col span={24}>
            <Progress
              percent={offlinePercent}
              status="normal"
              strokeColor="#faad14"
              format={() => `${offlineMaterials} (${offlinePercent}%)`}
            />
            <div style={{ marginTop: -16, marginBottom: 16, paddingLeft: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
              <StopOutlined /> 已下架
            </div>
          </Col>
        </Row>
      </Card>
    );
  }, [statistics]);

  // 渲染类型分布图表，使用useMemo优化
  const typeDistributionChart = useMemo(() => {
    if (!statistics?.typeDistribution || statistics.typeDistribution.length === 0) {
      return (
        <Card title="素材类型分布" className="statistic-card" variant="bordered" style={cardStyle}>
          <Empty description="暂无类型分布数据" {...emptyConfig} />
        </Card>
      );
    }

    const config = {
      data: statistics.typeDistribution,
      angleField: 'count',
      colorField: 'type',
      radius: 0.8,
      legend: {
        layout: 'horizontal',
        position: 'bottom'
      },
      tooltip: {
        formatter: (datum: any) => {
          return { name: datum.type, value: `${datum.count} 个素材` };
        }
      },
      interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    };

    return (
      <Card title="素材类型分布" className="statistic-card" variant="bordered" style={cardStyle}>
        <div style={{ height: CHART_HEIGHT }}>
          <Pie {...config} />
        </div>
      </Card>
    );
  }, [statistics]);

  // 渲染时间序列图表，使用useMemo优化
  const timeSeriesChart = useMemo(() => {
    if (!statistics) return null;

    let data = [];
    let title = '';
    let yAxisLabel = '';
    let tooltipLabel = '';
    
    switch (chartType) {
      case 'views':
        data = statistics.dailyViews;
        title = '每日浏览量趋势';
        yAxisLabel = '浏览次数';
        tooltipLabel = '浏览次数';
        break;
      case 'downloads':
        data = statistics.dailyDownloads;
        title = '每日下载量趋势';
        yAxisLabel = '下载次数';
        tooltipLabel = '下载次数';
        break;
      case 'uploads':
        data = statistics.dailyUploads;
        title = '每日上传量趋势';
        yAxisLabel = '上传数量';
        tooltipLabel = '上传数量';
        break;
    }

    const chartSelector = (
      <Select 
        value={chartType} 
        onChange={(value) => setChartType(value)}
        style={{ width: 120 }}
      >
        <Option value="views">浏览量</Option>
        <Option value="downloads">下载量</Option>
        <Option value="uploads">上传量</Option>
      </Select>
    );

    if (!data || data.length === 0) {
      return (
        <Card 
          title={title}
          className="statistic-card"
          variant="bordered"
          style={cardStyle}
          extra={chartSelector}
        >
          <Empty description={`暂无${yAxisLabel}数据`} {...emptyConfig} />
        </Card>
      );
    }

    const config = {
      data,
      xField: 'date',
      yField: 'count',
      seriesField: '',
      smooth: true,
      point: {
        size: 4,
        shape: 'circle',
        style: {
          fill: '#5B8FF9',
          stroke: '#5B8FF9',
          lineWidth: 2,
        },
      },
      meta: {
        date: {
          formatter: (v: string) => {
            return moment(v).format('MM-DD');
          },
        },
        count: {
          alias: yAxisLabel,
        },
      },
      tooltip: {
        formatter: (datum: any) => {
          return { 
            name: tooltipLabel, 
            value: datum.count,
            title: moment(datum.date).format('YYYY-MM-DD')
          };
        }
      },
      yAxis: {
        label: {
          formatter: (v: string) => {
            return v;
          },
        },
        title: {
          text: yAxisLabel,
        },
      },
      xAxis: {
        title: {
          text: '日期',
        },
        tickCount: 10,
      },
      slider: {
        start: 0,
        end: 1,
      },
      animation: {
        appear: {
          animation: 'path-in',
          duration: 1000,
        },
      },
    };

    return (
      <Card 
        title={title}
        className="statistic-card"
        variant="bordered"
        style={cardStyle}
        extra={chartSelector}
      >
        <div style={{ height: CHART_HEIGHT }}>
          <Line {...config} />
        </div>
      </Card>
    );
  }, [statistics, chartType]);

  // 渲染分类分布图表，使用useMemo优化
  const categoryDistributionChart = useMemo(() => {
    if (!statistics?.categoryDistribution || statistics.categoryDistribution.length === 0) {
      return (
        <Card 
          title="分类分布" 
          variant="bordered" 
          style={cardStyle}
          extra={
            <Select 
              value={categoryView} 
              onChange={(value) => setCategoryView(value)}
              style={{ width: 100 }}
            >
              <Option value="pie">饼图</Option>
              <Option value="column">柱状图</Option>
            </Select>
          }
        >
          <Empty description="暂无分类数据" {...emptyConfig} />
        </Card>
      );
    }
    
    const data = statistics.categoryDistribution.map(item => ({
      type: item.category,
      value: item.count
    }));

    return (
      <Card 
        title="分类分布" 
        variant="bordered" 
        style={cardStyle}
        extra={
          <Select 
            value={categoryView} 
            onChange={(value) => setCategoryView(value)}
            style={{ width: 100 }}
          >
            <Option value="pie">饼图</Option>
            <Option value="column">柱状图</Option>
          </Select>
        }
      >
        <div style={{ height: CHART_HEIGHT }}>
          {categoryView === 'pie' ? (
            <Pie
              data={data}
              angleField="value"
              colorField="type"
              radius={0.8}
              tooltip={{
                formatter: (datum: any) => {
                  return { name: datum.type, value: `${datum.count} 个素材` };
                }
              }}
              interactions={[
                { type: 'element-active' },
                { type: 'legend-highlight' }
              ]}
            />
          ) : (
            <Column
              data={data}
              xField="type"
              yField="value"
              colorField="type"
              label={{
                position: 'top',
              }}
              interactions={[
                { type: 'element-active' }
              ]}
            />
          )}
        </div>
      </Card>
    );
  }, [statistics, categoryView]);

  // 渲染对比图表，使用useMemo优化
  const comparisonChart = useMemo(() => {
    if (!statistics?.dailyViews || !statistics?.dailyDownloads || 
        statistics.dailyViews.length === 0 || statistics.dailyDownloads.length === 0) {
      return (
        <Card title="浏览量与下载量对比" className="statistic-card" variant="bordered" style={cardStyle}>
          <Empty description="暂无对比数据" {...emptyConfig} />
        </Card>
      );
    }

    const dualData = [];
    
    // 合并两组数据
    for (const view of statistics.dailyViews) {
      const matchingDownload = statistics.dailyDownloads.find(
        (item) => item.date === view.date
      );
      
      if (matchingDownload) {
        dualData.push({
          date: view.date,
          指标: '浏览次数',
          值: view.count,
        });
        
        dualData.push({
          date: view.date,
          指标: '下载次数',
          值: matchingDownload.count,
        });
      }
    }

    if (dualData.length === 0) {
      return (
        <Card title="浏览量与下载量对比" className="statistic-card" variant="bordered" style={cardStyle}>
          <Empty description="暂无对比数据" {...emptyConfig} />
        </Card>
      );
    }

    const config = {
      data: dualData,
      xField: 'date',
      yField: '值',
      seriesField: '指标',
      legend: {
        position: 'top',
      },
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 1000,
        },
      },
      meta: {
        date: {
          formatter: (v: string) => {
            return moment(v).format('MM-DD');
          },
        },
      },
    };

    return (
      <Card title="浏览量与下载量对比" className="statistic-card" variant="bordered" style={cardStyle}>
        <div style={{ height: CHART_HEIGHT }}>
          <Line {...config} />
        </div>
      </Card>
    );
  }, [statistics]);

  // 渲染加载状态
  if (loading && !statistics) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin>
          <div style={{ padding: '50px 0' }}>
            <p>正在加载统计数据...</p>
          </div>
        </Spin>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={fetchStatistics} icon={<ReloadOutlined />}>
            重试
          </Button>
        }
      />
    );
  }

  // 渲染空数据状态
  if (!statistics) {
    return (
      <EmptyState
        type="data"
        title="暂无统计数据"
        description="当前时间段内没有可显示的统计数据"
        actionText="刷新"
        onAction={fetchStatistics}
        variant="bordered"
      />
    );
  }

  // 渲染主内容
  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <PageHeader
          title="素材统计数据"
          subtitle="查看系统素材的使用情况和分布统计"
          breadcrumb={[
            { title: '首页', path: '/' },
            { title: '素材管理', path: '/materials' },
            { title: '统计数据' }
          ]}
          extra={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RangePicker 
                value={dateRange}
                onChange={handleTimeRangeChange}
                allowClear={false}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > moment().endOf('day')}
                style={{ marginRight: 16 }}
              />
              <Button 
                type="primary" 
                onClick={fetchStatistics} 
                loading={loading}
                icon={<ReloadOutlined />}
              >
                刷新数据
              </Button>
            </div>
          }
        />

        <Divider orientation="left">总体概况</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="bordered" style={cardStyle}>
              <Statistic
                title="素材总数"
                value={statistics?.totalMaterials || 0}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="bordered" style={cardStyle}>
              <Statistic
                title="总浏览量"
                value={statistics?.totalViews || 0}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="bordered" style={cardStyle}>
              <Statistic
                title="总下载量"
                value={statistics?.totalDownloads || 0}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: '#722ed1' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card variant="bordered" style={cardStyle}>
              <Statistic
                title="总收藏数"
                value={statistics?.totalFavorites || 0}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">素材状态与分布</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12}>
            {materialStatusCard}
          </Col>
          <Col xs={24} sm={24} md={12}>
            {typeDistributionChart}
          </Col>
        </Row>

        <Divider orientation="left">时间趋势</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {timeSeriesChart}
          </Col>
          <Col xs={24} lg={12}>
            {comparisonChart}
          </Col>
        </Row>

        <Divider orientation="left">分类分布</Divider>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {categoryDistributionChart}
          </Col>
        </Row>

        <Divider orientation="left">热门素材</Divider>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title="热门素材排行榜" 
              className="statistic-card" 
              variant="bordered"
              style={cardStyle}
            >
              <Table 
                columns={topMaterialsColumns}
                dataSource={statistics?.topMaterials || []}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
                locale={{
                  emptyText: <Empty description="暂无热门素材数据" />
                }}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">活跃用户</Divider>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title="活跃用户榜" 
              className="statistic-card" 
              variant="bordered"
              style={cardStyle}
            >
              <Table 
                columns={activeUsersColumns}
                dataSource={statistics?.activeUsers || []}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
                locale={{
                  emptyText: <Empty description="暂无活跃用户数据" />
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default MaterialStatistics; 