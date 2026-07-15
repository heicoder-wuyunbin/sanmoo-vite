import React, { useCallback, useRef } from 'react';
import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { login, sendLoginVerificationCode, checkMFA } from '@/services/blog/api';
import type { RequestError } from '@/services/request';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import GeometricCharacters from './GeometricCharacters';
import type { Expression } from './GeometricCharacters';
import './index.css';

type LoginFormValues = {
  username: string;
  password: string;
  code?: string;
  remember?: boolean;
};

const Login: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [sendingCode, setSendingCode] = React.useState(false);
  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [identifier, setIdentifier] = React.useState('');
  const setAuthInfo = useAuthStore((state) => state.setAuthInfo);
  const [form] = Form.useForm<LoginFormValues>();

  // 趣味交互状态
  const [expression, setExpression] = React.useState<Expression>('idle');
  const [eyeTracking, setEyeTracking] = React.useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = React.useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 鼠标是否在左侧区域
  const mouseOverLeft = useRef(false);

  const redirectPath = searchParams.get('redirect') || '/admin';

  // ========== 发射彩带 ==========
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#7c3aed', '#f97316', '#eab308', '#1e1b4b', '#22c55e'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#7c3aed', '#f97316', '#eab308', '#1e1b4b', '#ec4899'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // ========== 鼠标跟踪：角色眼睛跟随鼠标 ==========
  const handleLeftMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // 鼠标相对于左侧面板中心的偏移
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    // 映射到瞳孔偏移范围 (-6 ~ 6)
    setEyeTracking({ x: dx * 6, y: dy * 6 });
  }, []);

  const handleLeftMouseEnter = useCallback(() => {
    mouseOverLeft.current = true;
  }, []);

  const handleLeftMouseLeave = useCallback(() => {
    mouseOverLeft.current = false;
    // 离开时瞳孔归位
    if (!isTyping) {
      setExpression('idle');
      setEyeTracking({ x: 0, y: 0 });
    }
  }, [isTyping]);

  // ========== 输入框聚焦/输入 ==========
  const handleFocus = useCallback(() => {
    setExpression('focused');
    if (!mouseOverLeft.current) {
      setEyeTracking({ x: 4, y: 0 });
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (!isTyping && !mouseOverLeft.current) {
      setExpression('idle');
      setEyeTracking({ x: 0, y: 0 });
    }
  }, [isTyping]);

  const handleInputChange = useCallback(() => {
    setIsTyping(true);
    setExpression('typing');
    if (!mouseOverLeft.current) {
      setEyeTracking({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 6 });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (!mouseOverLeft.current) {
        setExpression('focused');
        setEyeTracking({ x: 3, y: 0 });
      }
    }, 800);
  }, []);

  // ========== 点击角色交互 ==========
  const handleCharacterClick = useCallback((_type: string) => {
    // 切换一次表情做反馈
    setExpression('focused');
    setEyeTracking({ x: 0, y: -3 });
    setTimeout(() => {
      if (!isTyping && !mouseOverLeft.current) {
        setExpression('idle');
        setEyeTracking({ x: 0, y: 0 });
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== 登录逻辑 ==========
  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setExpression('loading');
    try {
      // 如果开启了 MFA，需要先检查是否需要验证码
      if (!mfaRequired) {
        // 先检查该用户是否需要邮箱验证码
        const mfaRes = await checkMFA({ username: values.username });
        if (mfaRes.data?.needMfa) {
          setMfaRequired(true);
          message.info('该账号已开启邮箱验证码，请先发送并填写验证码');
          setExpression('focused');
          setLoading(false);
          return;
        }
      }

      // 如果 MFA 已开启，需要带验证码登录
      if (mfaRequired && !values.code) {
        message.error('请输入邮箱验证码');
        setLoading(false);
        return;
      }

      const response = await login(values);
      const data: {
        accessToken?: string;
        refreshToken?: string;
        username?: string;
        roleName?: string;
        user?: { username?: string; roleName?: string };
      } = response.data as any;

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const username =
        data.username ??
        data.user?.username ??
        (data as { user?: { Username?: string } }).user?.Username ??
        values.username;
      const roleName =
        data.roleName ??
        data.user?.roleName ??
        (data as { user?: { RoleName?: string } }).user?.RoleName ??
        '';

      if (!accessToken) {
        message.error('登录响应缺少有效的 Token，请稍后重试');
        setExpression('fail');
        setTimeout(() => setExpression('idle'), 2000);
        return;
      }

      setExpression('success');
      fireConfetti();
      setAuthInfo(accessToken, refreshToken || '', { username, roleName });
      message.success('登录成功');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 600);
    } catch (error) {
      const requestError = error as RequestError;

      const errorMessage = requestError.errorMessage || requestError.message || '';
      const networkErrorMessages = ['Failed to fetch', 'Network request failed'];
      const displayMessage =
        errorMessage && !networkErrorMessages.includes(errorMessage)
          ? errorMessage
          : '登录失败，请检查网络连接';
      message.error(displayMessage);
      console.error('登录错误:', error);
      setExpression('fail');
      setTimeout(() => setExpression('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const onSendCode = async () => {
    try {
      const { username, password } = await form.validateFields(['username', 'password']);
      setSendingCode(true);
      const res = await sendLoginVerificationCode({ username, password });
      setIdentifier(res.data?.identifier || '');
      message.success('验证码已发送，请核对识别码后输入验证码');
    } catch (error) {
      const formError = error as { errorFields?: unknown[] };
      if (formError?.errorFields?.length) return;
      const requestError = error as RequestError;
      message.error(requestError.errorMessage || requestError.message || '验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div className="login-page">
      {/* 左侧：几何角色区 + 鼠标跟踪 */}
      <div
        className="login-left"
        onMouseMove={handleLeftMouseMove}
        onMouseEnter={handleLeftMouseEnter}
        onMouseLeave={handleLeftMouseLeave}
      >
        <GeometricCharacters
          expression={expression}
          eyeTracking={eyeTracking}
          onCharacterClick={handleCharacterClick}
        />
      </div>

      {/* 右侧：登录表单 */}
      <div className="login-right">
        <div className="login-card">
          <Typography.Title level={3} className="login-title">
            欢迎回来
          </Typography.Title>
          <Typography.Text type="secondary" className="login-subtitle">
            Sanmoo Blog · Admin Console
          </Typography.Text>

          <Form
            form={form}
            name="normal_login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                placeholder="用户名"
                autoComplete="username"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleInputChange}
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                placeholder="密码"
                autoComplete="current-password"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleInputChange}
              />
            </Form.Item>

            {mfaRequired ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    验证码已发送至邮箱，请核对识别码后输入验证码。
                  </Typography.Text>
                </div>
                <Form.Item name="code" rules={[{ required: true, message: '请输入邮箱验证码' }]}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      prefix={
                        <span style={{ fontWeight: 600, color: '#1890ff', marginRight: 8, letterSpacing: 2 }}>
                          {identifier || '---'}
                        </span>
                      }
                      placeholder="请输入验证码"
                      autoComplete="one-time-code"
                    />
                    <Button onClick={onSendCode} loading={sendingCode}>
                      发送验证码
                    </Button>
                  </Space.Compact>
                </Form.Item>
              </>
            ) : (
              <Form.Item>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  如账号已开启邮箱验证码，首次提交登录后会提示发送验证码
                </Typography.Text>
              </Form.Item>
            )}

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%' }}
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;