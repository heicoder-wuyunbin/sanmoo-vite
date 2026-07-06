import { Button, Card, Form, Input, Space, Switch } from 'antd';
import React from 'react';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const SocialLinksTab: React.FC<SettingsTabProps> = ({ saveConfig, savingConfig }) => (
  <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
    <Form.Item name={['uiConfig', 'githubHome']} label="GitHub 首页"><Input /></Form.Item>
    <Form.Item name={['uiConfig', 'csdnHome']} label="CSDN 首页"><Input /></Form.Item>
    <Form.Item name={['uiConfig', 'giteeHome']} label="Gitee 首页"><Input /></Form.Item>
    <Form.Item name={['uiConfig', 'zhihuHome']} label="知乎首页"><Input /></Form.Item>
    <Space size={24} wrap>
      {(['github', 'csdn', 'gitee', 'zhihu'] as const).map((key) => (
        <Form.Item key={key} name={['uiConfig', `${key}Show`]} label={`显示 ${key[0].toUpperCase() + key.slice(1)}`} valuePropName="checked">
          <Switch />
        </Form.Item>
      ))}
    </Space>
    <Form.Item>
      <Button type="primary" loading={savingConfig === 'ui'} onClick={() => saveConfig('ui', ['uiConfig'])}>
        保存社交链接配置
      </Button>
    </Form.Item>
  </Card>
);

export default SocialLinksTab;
