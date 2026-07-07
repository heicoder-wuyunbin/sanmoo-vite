import React, { useEffect, useState } from 'react';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

interface ImageLightboxProps {
  visible: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
  images?: string[];
  currentIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  visible,
  src,
  alt = '',
  onClose,
  images = [],
  currentIndex = 0,
  onPrev,
  onNext,
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (visible) {
      setScale(1);
    }
  }, [visible, src]);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.2, 3));
      } else if (e.key === '-') {
        setScale((s) => Math.max(s - 0.2, 0.5));
      } else if (e.key === '0') {
        setScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose, onPrev, onNext]);

  if (!visible) return null;

  const hasNavigation = images.length > 1 && onPrev && onNext;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'zoom-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          fontSize: 20,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
      >
        <CloseOutlined />
      </button>

      {/* 左箭头 */}
      {hasNavigation && (
        <button
          onClick={onPrev}
          style={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          <LeftOutlined />
        </button>
      )}

      {/* 右箭头 */}
      {hasNavigation && (
        <button
          onClick={onNext}
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 20,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          <RightOutlined />
        </button>
      )}

      {/* 图片 */}
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          transform: `scale(${scale})`,
          transition: 'transform 0.2s',
          cursor: 'zoom-in',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (scale < 2) {
            setScale(scale + 0.5);
          } else {
            setScale(1);
          }
        }}
        draggable={false}
      />

      {/* 图片计数 */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: 14,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '6px 12px',
            borderRadius: 8,
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* 提示 */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 12,
        }}
      >
        按 ESC 关闭 · 点击图片缩放 · 方向键切换
      </div>
    </div>
  );
};

export default ImageLightbox;