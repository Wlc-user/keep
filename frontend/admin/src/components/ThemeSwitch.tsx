import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

interface ThemeSwitchProps {
  darkMode: boolean;
  onChange: (isDark: boolean) => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ darkMode, onChange }) => {
  return (
    <Switch
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
      checked={darkMode}
      onChange={onChange}
      style={{ backgroundColor: darkMode ? '#177ddc' : undefined }}
    />
  );
};

export default ThemeSwitch; 