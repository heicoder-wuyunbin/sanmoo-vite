import React, { useCallback, useRef } from 'react';

export type Expression = 'idle' | 'focused' | 'typing' | 'loading' | 'success' | 'fail';

interface CharacterProps {
  type: 'purple-tall' | 'black-tall' | 'orange-half' | 'yellow-round';
  expression: Expression;
  eyeTracking: { x: number; y: number };
  className?: string;
  onClick?: () => void;
}

// 每种角色的基准尺寸放大到 ~2x
const sizeMap = {
  'purple-tall': { w: 110, h: 200 },
  'black-tall': { w: 95, h: 175 },
  'orange-half': { w: 190, h: 100 },
  'yellow-round': { w: 170, h: 130 },
};

// 每种角色的配色
const colorMap = {
  'purple-tall': { bg: 'linear-gradient(135deg, #7c3aed, #a78bfa)', shadow: 'rgba(124, 58, 237, 0.4)' },
  'black-tall': { bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', shadow: 'rgba(30, 27, 75, 0.45)' },
  'orange-half': { bg: 'linear-gradient(135deg, #f97316, #fb923c)', shadow: 'rgba(249, 115, 22, 0.4)' },
  'yellow-round': { bg: 'linear-gradient(135deg, #eab308, #facc15)', shadow: 'rgba(234, 179, 8, 0.45)' },
};

const Character: React.FC<CharacterProps> = ({ type, expression, eyeTracking, className, onClick }) => {
  const clampEye = (v: number) => Math.max(-6, Math.min(6, v));

  const getBodyStyle = (): React.CSSProperties => {
    const { w, h } = sizeMap[type];
    const { bg, shadow } = colorMap[type];
    const borderRadiusMap: Record<string, string> = {
      'purple-tall': '18px',
      'black-tall': '16px',
      'orange-half': '80px 80px 0 0',
      'yellow-round': '24px',
    };

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: w,
      height: h,
      background: bg,
      borderRadius: borderRadiusMap[type],
      boxShadow: `0 12px 40px ${shadow}`,
      transition: 'transform 0.3s ease, filter 0.3s ease',
      cursor: 'pointer',
      userSelect: 'none' as const,
    };
  };

  const getEyeStyle = (): React.CSSProperties => {
    // 偷看时眼睛更大
    const baseEyeSize = expression === 'focused' || expression === 'typing' ? 18 : expression === 'loading' ? 10 : 14;

    if (expression === 'success') {
      return {
        width: baseEyeSize + 8,
        height: baseEyeSize + 8,
        background: 'transparent',
        border: 'none',
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: baseEyeSize + 8,
        lineHeight: 1,
      };
    }

    return {
      width: baseEyeSize,
      height: baseEyeSize,
      background: '#fff',
      borderRadius: '50%',
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  const getPupilStyle = (): React.CSSProperties => {
    if (expression === 'success') return { display: 'none' };
    const pupilSize = expression === 'focused' || expression === 'typing' ? 8 : expression === 'loading' ? 4 : 6;
    return {
      width: pupilSize,
      height: pupilSize,
      background: '#1a1a2e',
      borderRadius: '50%',
      transform: `translate(${clampEye(eyeTracking.x)}px, ${clampEye(eyeTracking.y)}px)`,
      transition: 'transform 0.12s ease-out',
    };
  };

  const renderMouth = () => {
    const commonStyle: React.CSSProperties = { transition: 'all 0.3s ease' };
    switch (expression) {
      case 'success':
        return (
          <div style={{ ...commonStyle, width: 28, height: 14, borderBottom: '3px solid #1a1a2e', borderLeft: '3px solid #1a1a2e', borderRight: '3px solid #1a1a2e', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderTop: 'none' }} />
        );
      case 'fail':
        return (
          <div style={{ ...commonStyle, width: 22, height: 10, borderTop: '3px solid #1a1a2e', borderLeft: '3px solid #1a1a2e', borderRight: '3px solid #1a1a2e', borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottom: 'none' }} />
        );
      case 'loading':
        return <div style={{ ...commonStyle, width: 10, height: 10, background: '#1a1a2e', borderRadius: '50%' }} />;
      case 'focused':
      case 'typing':
        return <div style={{ ...commonStyle, width: 12, height: 12, background: '#1a1a2e', borderRadius: '50%' }} />;
      default:
        return (
          <div style={{ ...commonStyle, width: 20, height: 10, borderBottom: '3px solid #1a1a2e', borderLeft: '3px solid #1a1a2e', borderRight: '3px solid #1a1a2e', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTop: 'none' }} />
        );
    }
  };

  const renderEyebrows = () => {
    if (expression !== 'fail') return null;
    return (
      <>
        <div style={{ position: 'absolute' as const, width: 16, height: 2, background: '#1a1a2e', top: -8, left: -6, transform: 'rotate(-20deg)', borderRadius: 1 }} />
        <div style={{ position: 'absolute' as const, width: 16, height: 2, background: '#1a1a2e', top: -8, right: -6, transform: 'rotate(20deg)', borderRadius: 1 }} />
      </>
    );
  };

  const renderCover = () => {
    if (expression !== 'typing') return null;
    const shouldCover = type === 'purple-tall' || type === 'orange-half';
    if (!shouldCover) return null;
    return (
      <div className="character-cover" style={{ position: 'absolute' as const, top: '26%', left: '4%', right: '4%', height: '26%', background: 'rgba(255,255,255,0.8)', borderRadius: 8, animation: 'coverPeek 0.6s ease-in-out infinite', zIndex: 2 }} />
    );
  };

  const renderEyes = () => {
    const eyeStyle = getEyeStyle();
    return (
      <div style={{ display: 'flex', gap: 14, position: 'relative' as const }}>
        <div style={eyeStyle}>
          {expression === 'success' ? '♥' : <div style={getPupilStyle()} />}
          {renderEyebrows()}
        </div>
        <div style={eyeStyle}>
          {expression === 'success' ? '♥' : <div style={getPupilStyle()} />}
        </div>
      </div>
    );
  };

  // 点击弹跳 / 抖动效果
  const [animStyle, setAnimStyle] = React.useState<React.CSSProperties>({});
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    onClick?.();
    setAnimStyle({ animation: 'characterClickPop 0.4s ease' });
    if (animRef.current) clearTimeout(animRef.current);
    animRef.current = setTimeout(() => setAnimStyle({}), 400);
  }, [onClick]);

  // 长条角色偷看时右弯
  const isTall = type === 'purple-tall' || type === 'black-tall';
  const peekClass = isTall && (expression === 'focused' || expression === 'typing')
    ? (expression === 'typing' ? 'character-peeking' : 'character-focused')
    : '';

  // success 时跳动
  const successBounce = expression === 'success' ? 'characterBounce 0.5s ease infinite' : 'none';

  return (
    <div
      className={`character character-${type} ${peekClass} ${className || ''}`}
      style={{ ...getBodyStyle(), animation: successBounce, ...animStyle }}
      onClick={handleClick}
    >
      {renderCover()}
      {renderEyes()}
      {renderMouth()}
    </div>
  );
};

interface GeometricCharactersProps {
  expression: Expression;
  eyeTracking: { x: number; y: number };
  onCharacterClick?: (type: string) => void;
}

const GeometricCharacters: React.FC<GeometricCharactersProps> = ({ expression, eyeTracking, onCharacterClick }) => {
  return (
    <div className="characters-container">
      <Character type="purple-tall" expression={expression} eyeTracking={eyeTracking} className="char-1" onClick={() => onCharacterClick?.('purple-tall')} />
      <Character type="yellow-round" expression={expression} eyeTracking={eyeTracking} className="char-2" onClick={() => onCharacterClick?.('yellow-round')} />
      <Character type="orange-half" expression={expression} eyeTracking={eyeTracking} className="char-3" onClick={() => onCharacterClick?.('orange-half')} />
      <Character type="black-tall" expression={expression} eyeTracking={eyeTracking} className="char-4" onClick={() => onCharacterClick?.('black-tall')} />
    </div>
  );
};

export default GeometricCharacters;