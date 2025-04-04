$components = @(
    @{ Name = "CourseDetail"; Label = "课程详情" },
    @{ Name = "CourseForm"; Label = "课程表单" },
    @{ Name = "CourseChapters"; Label = "课程章节" },
    @{ Name = "MaterialDetail"; Label = "学习材料详情" },
    @{ Name = "MaterialSearch"; Label = "学习材料搜索" },
    @{ Name = "MaterialUpload"; Label = "学习材料上传" },
    @{ Name = "MaterialCategoryManagement"; Label = "学习材料分类管理" },
    @{ Name = "StudentCourseList"; Label = "学生课程列表" },
    @{ Name = "StudentLearningCenter"; Label = "学生学习中心" },
    @{ Name = "StudentLearningProgress"; Label = "学生学习进度" },
    @{ Name = "StudentEvaluation"; Label = "学生评估" },
    @{ Name = "TeacherManagement"; Label = "教师管理" },
    @{ Name = "TeacherCourseManagement"; Label = "教师课程管理" },
    @{ Name = "TeacherResearchGroup"; Label = "教师研究小组" },
    @{ Name = "TeacherAssignmentManagement"; Label = "教师作业管理" },
    @{ Name = "TeacherAssignmentGrading"; Label = "教师作业评分" },
    @{ Name = "KnowledgeGraphManagement"; Label = "知识图谱管理" },
    @{ Name = "ExamManagement"; Label = "考试管理" },
    @{ Name = "ExamCenter"; Label = "考试中心" },
    @{ Name = "ExamReview"; Label = "考试审核" },
    @{ Name = "ExamAnalytics"; Label = "考试分析" },
    @{ Name = "UserProfile"; Label = "用户资料" },
    @{ Name = "NotificationPage"; Label = "通知页面" },
    @{ Name = "SystemSettings"; Label = "系统设置" },
    @{ Name = "Diagnostics"; Label = "系统诊断" }
)

foreach ($component in $components) {
    $name = $component.Name
    $label = $component.Label
    $content = @"
import React from 'react';

const $name: React.FC = () => {
  return (
    <div>
      <h2>$label</h2>
      <p>此页面正在开发中，即将推出...</p>
    </div>
  );
};

export default $name;
"@

    $filePath = Join-Path -Path $PWD -ChildPath "$name.tsx"
    $content | Out-File -FilePath $filePath -Encoding utf8

    Write-Host "Created: $name.tsx"
}

Write-Host "All placeholder components have been created." 