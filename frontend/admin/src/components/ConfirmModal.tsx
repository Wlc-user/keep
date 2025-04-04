import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ConfirmModalProps {
  title?: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk: () => void;
  onCancel: () => void;
  width?: number;
  centered?: boolean;
  type?: 'info' | 'success' | 'error' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = '确认操作',
  content,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  width = 420,
  centered = true,
  type = 'warning'
}) => {
  // 根据类型设置图标颜色
  let iconColor = '#faad14'; // 默认警告色
  if (type === 'info') iconColor = '#1890ff';
  else if (type === 'success') iconColor = '#52c41a';
  else if (type === 'error') iconColor = '#ff4d4f';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExclamationCircleOutlined style={{ color: iconColor, marginRight: 8 }} />
          <Text strong>{title}</Text>
        </div>
      }
      open={true}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      width={width}
      centered={centered}
      maskClosable={false}
    >
      <div style={{ marginLeft: 30 }}>
        {content}
      </div>
    </Modal>
  );
};

// 静态方法，方便直接调用
ConfirmModal.show = (props: ConfirmModalProps) => {
  const { onOk, onCancel, ...restProps } = props;
  
  Modal.confirm({
    icon: <ExclamationCircleOutlined />,
    okText: props.okText || '确定',
    cancelText: props.cancelText || '取消',
    onOk: onOk,
    onCancel: onCancel,
    ...restProps
  });
};

export default ConfirmModal; 