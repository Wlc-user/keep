// 学习中心模拟数据
export const learningCenterMock = {
  // 推荐学习资源
  recommendedResources: [
    {
      id: 'res-1',
      title: 'JavaScript高级编程技巧',
      description: '本课程将介绍JavaScript的高级编程技巧，包括闭包、原型链、异步编程等内容，帮助你提升JavaScript开发能力。',
      type: 'video',
      category: '编程',
      difficulty: 'intermediate',
      duration: 60,
      author: '李教授',
      thumbnail: 'https://picsum.photos/200/120?random=1',
      url: '/course/javascript-advanced',
      tags: ['JavaScript', '前端开发', '编程技巧'],
      rating: 4.8,
      popularity: 1256,
      completionRate: 30,
      relevanceScore: 95
    },
    {
      id: 'res-2',
      title: 'Python数据分析实战',
      description: '使用Python进行数据分析的实战课程，学习Pandas、NumPy等库的使用，掌握数据清洗、可视化和分析技巧。',
      type: 'course',
      category: '数据科学',
      difficulty: 'intermediate',
      duration: 120,
      author: '王老师',
      thumbnail: 'https://picsum.photos/200/120?random=2',
      url: '/course/python-data-analysis',
      tags: ['Python', '数据分析', 'Pandas'],
      rating: 4.6,
      popularity: 982,
      completionRate: 0,
      relevanceScore: 88
    },
    {
      id: 'res-3',
      title: '机器学习入门指南',
      description: '机器学习基础理论与实践的入门课程，介绍常用算法、模型评估与实际应用案例。',
      type: 'ebook',
      category: '人工智能',
      difficulty: 'beginner',
      duration: 180,
      author: '张博士',
      thumbnail: 'https://picsum.photos/200/120?random=3',
      url: '/ebook/machine-learning-intro',
      tags: ['机器学习', 'AI', '算法'],
      rating: 4.9,
      popularity: 1578,
      completionRate: 75,
      relevanceScore: 92
    },
    {
      id: 'res-4',
      title: 'Web前端开发实战',
      description: '全面的Web前端开发实战课程，涵盖HTML、CSS、JavaScript及现代前端框架的使用。',
      type: 'video',
      category: '编程',
      difficulty: 'beginner',
      duration: 90,
      author: '陈讲师',
      thumbnail: 'https://picsum.photos/200/120?random=4',
      url: '/course/web-frontend',
      tags: ['HTML', 'CSS', 'JavaScript', '前端'],
      rating: 4.7,
      popularity: 2356,
      completionRate: 50,
      relevanceScore: 89
    },
    {
      id: 'res-5',
      title: '数据结构与算法',
      description: '系统学习常用数据结构与算法，包括数组、链表、树、图以及排序、搜索等算法的原理与实现。',
      type: 'course',
      category: '计算机科学',
      difficulty: 'intermediate',
      duration: 150,
      author: '黄教授',
      thumbnail: 'https://picsum.photos/200/120?random=5',
      url: '/course/data-structure-algorithm',
      tags: ['数据结构', '算法', '编程基础'],
      rating: 4.5,
      popularity: 1125,
      completionRate: 25,
      relevanceScore: 85
    },
    {
      id: 'res-6',
      title: '深度学习与神经网络',
      description: '深入探讨深度学习理论与神经网络结构，学习如何构建和训练复杂的神经网络模型。',
      type: 'article',
      category: '人工智能',
      difficulty: 'advanced',
      duration: 45,
      author: '刘研究员',
      thumbnail: 'https://picsum.photos/200/120?random=6',
      url: '/article/deep-learning-neural-networks',
      tags: ['深度学习', '神经网络', 'AI'],
      rating: 4.9,
      popularity: 876,
      relevanceScore: 94
    },
    {
      id: 'res-7',
      title: '移动应用开发入门',
      description: '学习移动应用开发基础，包括UI设计、用户体验及常用开发框架的使用。',
      type: 'quiz',
      category: '移动开发',
      difficulty: 'beginner',
      duration: 30,
      author: '郑老师',
      thumbnail: 'https://picsum.photos/200/120?random=7',
      url: '/quiz/mobile-app-dev',
      tags: ['移动开发', 'UI设计', '用户体验'],
      rating: 4.3,
      popularity: 568,
      relevanceScore: 78
    },
    {
      id: 'res-8',
      title: '云计算与分布式系统',
      description: '介绍云计算架构与分布式系统设计原则，学习如何构建可扩展的云端应用。',
      type: 'exercise',
      category: '云计算',
      difficulty: 'advanced',
      duration: 75,
      author: '孙博士',
      thumbnail: 'https://picsum.photos/200/120?random=8',
      url: '/exercise/cloud-computing',
      tags: ['云计算', '分布式系统', '架构设计'],
      rating: 4.6,
      popularity: 752,
      completionRate: 15,
      relevanceScore: 82
    }
  ],
  
  // 学习计划
  learningPlans: [
    {
      id: 'plan-1',
      title: 'Web前端开发技能提升',
      startDate: '2023-07-01',
      endDate: '2023-08-31',
      goal: '系统学习现代前端开发技术，掌握React框架和性能优化技巧',
      progress: 65,
      completed: false,
      tasks: [
        {
          id: 'task-1-1',
          title: '完成HTML/CSS基础复习',
          date: '2023-07-05',
          completed: true,
          importance: 'medium'
        },
        {
          id: 'task-1-2',
          title: '学习JavaScript高级特性',
          date: '2023-07-12',
          completed: true,
          importance: 'high'
        },
        {
          id: 'task-1-3',
          title: 'React基础入门',
          date: '2023-07-20',
          completed: true,
          importance: 'high'
        },
        {
          id: 'task-1-4',
          title: 'React Hooks深入学习',
          date: '2023-07-28',
          completed: false,
          importance: 'high'
        },
        {
          id: 'task-1-5',
          title: '完成个人项目Demo',
          date: '2023-08-15',
          completed: false,
          importance: 'high'
        },
        {
          id: 'task-1-6',
          title: '前端性能优化技巧学习',
          date: '2023-08-25',
          completed: false,
          importance: 'medium'
        }
      ]
    },
    {
      id: 'plan-2',
      title: '数据科学学习路径',
      startDate: '2023-06-15',
      endDate: '2023-09-15',
      goal: '掌握数据分析和机器学习基础，能够独立完成数据分析项目',
      progress: 30,
      completed: false,
      tasks: [
        {
          id: 'task-2-1',
          title: 'Python编程基础',
          date: '2023-06-20',
          completed: true,
          importance: 'high'
        },
        {
          id: 'task-2-2',
          title: '学习Pandas数据处理',
          date: '2023-07-05',
          completed: true,
          importance: 'high'
        },
        {
          id: 'task-2-3',
          title: '数据可视化技巧',
          date: '2023-07-18',
          completed: false,
          importance: 'medium'
        },
        {
          id: 'task-2-4',
          title: '统计学基础复习',
          date: '2023-07-30',
          completed: false,
          importance: 'medium'
        },
        {
          id: 'task-2-5',
          title: '机器学习算法入门',
          date: '2023-08-15',
          completed: false,
          importance: 'high'
        },
        {
          id: 'task-2-6',
          title: '完成数据分析项目',
          date: '2023-09-10',
          completed: false,
          importance: 'high'
        }
      ]
    },
    {
      id: 'plan-3',
      title: '移动应用开发学习',
      startDate: '2023-08-01',
      endDate: '2023-10-15',
      goal: '学习移动应用开发基础，完成一个简单的Android应用',
      progress: 10,
      completed: false,
      tasks: [
        {
          id: 'task-3-1',
          title: 'Java语言基础复习',
          date: '2023-08-05',
          completed: true,
          importance: 'medium'
        },
        {
          id: 'task-3-2',
          title: 'Android开发环境搭建',
          date: '2023-08-08',
          completed: false,
          importance: 'low'
        },
        {
          id: 'task-3-3',
          title: 'Android UI设计基础',
          date: '2023-08-20',
          completed: false,
          importance: 'medium'
        },
        {
          id: 'task-3-4',
          title: '学习Activity和Fragment',
          date: '2023-09-05',
          completed: false,
          importance: 'high'
        },
        {
          id: 'task-3-5',
          title: '实现数据存储功能',
          date: '2023-09-20',
          completed: false,
          importance: 'medium'
        },
        {
          id: 'task-3-6',
          title: '完成简单Android应用',
          date: '2023-10-10',
          completed: false,
          importance: 'high'
        }
      ]
    }
  ],
  
  // 学习路径
  learningPaths: [
    {
      id: 'path-1',
      title: '前端开发工程师路径',
      description: '系统学习前端开发所需的知识与技能，从基础到高级，循序渐进地成为专业前端工程师。',
      progress: 45,
      stages: [
        {
          id: 'stage-1-1',
          title: 'Web基础',
          description: '学习网页开发的基本知识，包括HTML、CSS和JavaScript基础。',
          completed: true,
          locked: false,
          resources: [
            {
              id: 'res-1-1-1',
              title: 'HTML5核心概念',
              type: 'video',
              completed: true
            },
            {
              id: 'res-1-1-2',
              title: 'CSS3样式与布局',
              type: 'article',
              completed: true
            },
            {
              id: 'res-1-1-3',
              title: 'JavaScript基础语法',
              type: 'video',
              completed: true
            },
            {
              id: 'res-1-1-4',
              title: '响应式设计原则',
              type: 'quiz',
              completed: true
            }
          ]
        },
        {
          id: 'stage-1-2',
          title: '前端框架',
          description: '学习流行的前端框架，掌握组件化开发和状态管理。',
          completed: false,
          locked: false,
          resources: [
            {
              id: 'res-1-2-1',
              title: 'React基础入门',
              type: 'video',
              completed: true
            },
            {
              id: 'res-1-2-2',
              title: 'React Hooks详解',
              type: 'article',
              completed: true
            },
            {
              id: 'res-1-2-3',
              title: 'Redux状态管理',
              type: 'video',
              completed: false
            },
            {
              id: 'res-1-2-4',
              title: '前端路由实现原理',
              type: 'project',
              completed: false
            }
          ]
        },
        {
          id: 'stage-1-3',
          title: '高级前端技术',
          description: '学习前端性能优化、安全性和高级特性，提升开发技能。',
          completed: false,
          locked: true,
          resources: [
            {
              id: 'res-1-3-1',
              title: '前端性能优化策略',
              type: 'video',
              completed: false
            },
            {
              id: 'res-1-3-2',
              title: 'Web安全最佳实践',
              type: 'article',
              completed: false
            },
            {
              id: 'res-1-3-3',
              title: 'TypeScript高级特性',
              type: 'video',
              completed: false
            },
            {
              id: 'res-1-3-4',
              title: '前端微服务架构',
              type: 'project',
              completed: false
            }
          ]
        }
      ]
    },
    {
      id: 'path-2',
      title: '数据科学家成长路径',
      description: '从数据分析入门到高级机器学习应用，逐步成为数据科学专家的完整学习路径。',
      progress: 25,
      stages: [
        {
          id: 'stage-2-1',
          title: '数据分析基础',
          description: '学习数据处理、清洗和可视化的基本技能。',
          completed: true,
          locked: false,
          resources: [
            {
              id: 'res-2-1-1',
              title: 'Python数据处理入门',
              type: 'video',
              completed: true
            },
            {
              id: 'res-2-1-2',
              title: 'Pandas数据分析',
              type: 'article',
              completed: true
            },
            {
              id: 'res-2-1-3',
              title: '数据可视化技巧',
              type: 'quiz',
              completed: true
            }
          ]
        },
        {
          id: 'stage-2-2',
          title: '统计学与机器学习基础',
          description: '掌握统计学原理和基础机器学习算法。',
          completed: false,
          locked: false,
          resources: [
            {
              id: 'res-2-2-1',
              title: '统计学基础概念',
              type: 'video',
              completed: true
            },
            {
              id: 'res-2-2-2',
              title: '机器学习算法概述',
              type: 'article',
              completed: false
            },
            {
              id: 'res-2-2-3',
              title: '监督学习模型实现',
              type: 'project',
              completed: false
            }
          ]
        },
        {
          id: 'stage-2-3',
          title: '高级机器学习与深度学习',
          description: '学习高级机器学习技术和深度学习原理。',
          completed: false,
          locked: true,
          resources: [
            {
              id: 'res-2-3-1',
              title: '深度学习基础',
              type: 'video',
              completed: false
            },
            {
              id: 'res-2-3-2',
              title: '神经网络架构设计',
              type: 'article',
              completed: false
            },
            {
              id: 'res-2-3-3',
              title: '计算机视觉应用',
              type: 'project',
              completed: false
            }
          ]
        }
      ]
    }
  ],
  
  // 学习笔记
  studyNotes: [
    {
      id: 'note-1',
      title: 'JavaScript闭包详解',
      content: '闭包是JavaScript中一个重要的概念，指的是函数和其周围的状态的组合。这个状态包括在函数创建时可以访问的所有变量。\n\n闭包的核心特性是：\n1. 函数可以访问其被创建时的环境中的变量\n2. 这些变量可以在函数执行完毕后仍然保持其值\n\n闭包的常见应用场景：\n- 数据隐藏和封装\n- 函数工厂\n- 回调函数中保存状态\n\n需要注意的是，过度使用闭包可能导致内存泄漏，因为被引用的外部变量不会被垃圾回收。',
      createdAt: '2023-06-15T14:30:22Z',
      updatedAt: '2023-06-16T09:45:18Z',
      courseId: 'course-1',
      courseName: 'JavaScript高级编程',
      tags: ['JavaScript', '闭包', '高级特性']
    },
    {
      id: 'note-2',
      title: 'React Hooks使用技巧',
      content: 'React Hooks是React 16.8引入的新特性，让我们可以在函数组件中使用状态和其他React特性。\n\n常用的Hooks：\n\n1. useState - 用于在函数组件中添加状态\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n2. useEffect - 处理副作用，相当于componentDidMount和componentDidUpdate的组合\n```jsx\nuseEffect(() => {\n  document.title = `点击了${count}次`;\n}, [count]);\n```\n\n3. useContext - 在组件树中共享数据\n\n4. useReducer - 管理复杂的组件状态逻辑\n\n5. useCallback和useMemo - 性能优化，防止不必要的重渲染\n\n使用Hooks的注意事项：\n- 只能在函数组件顶层调用Hooks\n- 不要在循环、条件或嵌套函数中调用Hooks',
      createdAt: '2023-07-02T10:15:45Z',
      updatedAt: '2023-07-05T16:20:33Z',
      courseId: 'course-3',
      courseName: 'React实战开发',
      tags: ['React', 'Hooks', '前端']
    },
    {
      id: 'note-3',
      title: 'Python数据处理笔记',
      content: 'Pandas是Python中强大的数据分析工具，提供了高效的数据结构和数据分析工具。\n\n核心数据结构：\n1. Series - 一维标签数组\n2. DataFrame - 二维表格结构\n\n常用数据处理操作：\n\n```python\n# 读取CSV文件\ndf = pd.read_csv(\'data.csv\')\n\n# 数据选择\ndf[\'column_name\']  # 选择列\ndf.loc[0:5]        # 通过标签选择行\ndf.iloc[0:5]       # 通过位置选择行\n\n# 数据清洗\ndf.dropna()        # 删除缺失值\ndf.fillna(value)   # 填充缺失值\n\n# 数据转换\ndf.apply(function) # 应用函数\ndf.groupby(\'key\')  # 分组统计\n```\n\n数据可视化可以结合matplotlib或seaborn：\n```python\nimport matplotlib.pyplot as plt\ndf.plot(kind=\'bar\')\nplt.show()\n```',
      createdAt: '2023-08-12T09:30:15Z',
      updatedAt: '2023-08-12T09:30:15Z',
      courseId: 'course-5',
      courseName: 'Python数据分析',
      tags: ['Python', 'Pandas', '数据分析']
    }
  ]
}; 

// 将模拟数据注册到window对象以供访问
declare global {
  interface Window {
    __mockLearningCenterData: {
      learningCenterMock: typeof learningCenterMock;
    };
  }
}

// 注册到全局window对象
if (import.meta.env.DEV) {
  window.__mockLearningCenterData = {
    learningCenterMock: learningCenterMock
  };
  console.log('学习中心模拟数据已注册到全局对象');
} 