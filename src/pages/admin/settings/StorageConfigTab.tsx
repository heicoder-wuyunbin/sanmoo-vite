import { Button, Card, Form, Input, Select } from 'antd';
import React from 'react';
import type { SettingsTabProps } from './types';
import { ADMIN_CARD_STYLE } from '@/styles/layout';

const StorageConfigTab: React.FC<SettingsTabProps> = ({ saveConfig, savingConfig }) => (
  <Card style={{ ...ADMIN_CARD_STYLE, marginBottom: 16 }}>
    <Form.Item name={['storageConfig', 'uploadStrategy']} label="上传策略">
      <Select options={[
        { label: '本地', value: 'LOCAL' },
        { label: '七牛', value: 'QINIU' },
        { label: '阿里云', value: 'ALIYUN' },
      ]} />
    </Form.Item>
    <Form.Item name={['storageConfig', 'uploadLocalDir']} label="本地上传目录"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadLocalUrlPrefix']} label="本地 URL 前缀"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadQiniuBucket']} label="七牛 Bucket"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadQiniuDomain']} label="七牛域名"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadQiniuAccessKey']} label="七牛 AccessKey"><Input.Password /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadQiniuSecretKey']} label="七牛 SecretKey"><Input.Password /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadAliyunEndpoint']} label="阿里云 Endpoint"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadAliyunBucket']} label="阿里云 Bucket"><Input /></Form.Item>
    <Form.Item name={['storageConfig', 'uploadAliyunDomain']} label="阿里云域名"><Input /></Form.Item>
    <Form.Item>
      <Button type="primary" loading={savingConfig === 'storage'} onClick={() => saveConfig('storage', ['storageConfig'])}>
        保存存储配置
      </Button>
    </Form.Item>
  </Card>
);

export default StorageConfigTab;

