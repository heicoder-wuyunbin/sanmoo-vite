import type { FormInstance } from 'antd';
import type { BlogSettings } from '@/services/blog/api';

export type SettingsFormValues = BlogSettings & {
  emailVerifyCode?: string;
};

export interface SettingsTabProps {
  form: FormInstance<SettingsFormValues>;
  saveConfig: (configKey: string, fieldPath: string[]) => Promise<void>;
  savingConfig: string | null;
}
