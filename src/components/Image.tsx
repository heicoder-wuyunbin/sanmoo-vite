import React, { useEffect, useRef, useState } from 'react';

type ImageProps = {
  src: string;
  alt?: string;
  fallback?: string;
  style?: React.CSSProperties;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  lazy?: boolean;
};

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.png',
  style,
  className,
  onError,
  lazy = true,
}) => {
  const [loaded, setLoaded] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) {
      setLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoaded(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (e.target instanceof HTMLImageElement && e.target.src !== fallback) {
      e.target.src = fallback;
    }
    onError?.(e);
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className || ''}`}
      style={style}
    >
      {!loaded && !hasError && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton" />
        </div>
      )}
      <img
        src={loaded ? (hasError ? fallback : src) : ''}
        alt={alt}
        onError={handleError}
        className={`lazy-image ${loaded ? 'lazy-image-loaded' : 'lazy-image-hidden'}`}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </div>
  );
};

export default Image;
