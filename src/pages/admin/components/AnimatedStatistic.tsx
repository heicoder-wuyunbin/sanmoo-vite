import { Statistic, Typography, theme as antTheme } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

// ─── 动画 Hook ─────────────────────────────────────────────────

function useAnimatedValue(target: number, loading: boolean, duration: number) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (loading) return;
    let frameId = 0;
    const safeTarget = Number.isFinite(target) ? Math.max(0, target) : 0;
    const from = currentRef.current;
    const diff = safeTarget - from;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + diff * eased);
      setDisplay(next);
      currentRef.current = next;
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, loading, duration]);

  return display;
}

// ─── 子组件：单值 + 可选 extra ──────────────────────────────────

interface SingleStatProps {
  title: string;
  value: number;
  extra?: string;
  loading: boolean;
  duration: number;
}

const SingleStat: React.FC<SingleStatProps> = ({ title, value, extra, loading, duration }) => {
  const { token } = antTheme.useToken();
  const display = useAnimatedValue(value, loading, duration);
  return (
    <div>
      <Statistic title={title} value={display} />
      {extra && (
        <Typography.Text
          style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 4, display: 'block' }}
        >
          {extra}
        </Typography.Text>
      )}
    </div>
  );
};

// ─── 子组件：双值对比 ───────────────────────────────────────────

export interface PairItem {
  label: string;
  value: number;
}

interface PairStatProps {
  title: string;
  pair: [PairItem, PairItem];
  loading: boolean;
  duration: number;
}

const PairStat: React.FC<PairStatProps> = ({ title, pair, loading, duration }) => {
  const dispA = useAnimatedValue(pair[0].value, loading, duration);
  const dispB = useAnimatedValue(pair[1].value, loading, duration);
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 14 }}>{title}</Typography.Text>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Statistic title={pair[0].label} value={dispA} valueStyle={{ fontSize: 22 }} />
        <Statistic title={pair[1].label} value={dispB} valueStyle={{ fontSize: 22 }} />
      </div>
    </div>
  );
};

// ─── 对外组件 ───────────────────────────────────────────────────

interface BaseProps {
  title: string;
  loading?: boolean;
  duration?: number;
}

type Props =
  | (BaseProps & { value: number; extra?: string; pair?: never })
  | (BaseProps & { pair: [PairItem, PairItem]; value?: never; extra?: never });

const AnimatedStatistic: React.FC<Props> = (props) => {
  const { title, loading = false, duration = 900 } = props;

  if ('pair' in props && props.pair) {
    return <PairStat title={title} pair={props.pair} loading={loading} duration={duration} />;
  }

  return (
    <SingleStat
      title={title}
      value={(props as { value: number }).value}
      extra={(props as { extra?: string }).extra}
      loading={loading}
      duration={duration}
    />
  );
};

export default AnimatedStatistic;
