import React, { useEffect, useState } from 'react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AnimatedSizeCounter = ({ value, duration = 800 }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const prevValueRef = React.useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = Number(value) || 0;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const calculatedValue = Math.floor(progress * (end - start) + start);
      setCurrentValue(calculatedValue);
      prevValueRef.current = calculatedValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatFileSize(currentValue)}</span>;
};

export const AnimatedPercentageCounter = ({ value, duration = 800 }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const prevValueRef = React.useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = Number(value) || 0;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const calculatedValue = Number((progress * (end - start) + start).toFixed(2));
      setCurrentValue(calculatedValue);
      prevValueRef.current = calculatedValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentValue}%</span>;
};
