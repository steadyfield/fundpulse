import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

interface FlipNumberProps {
  value: number | null | undefined;
  decimals?: number;
  className?: string;
  prefix?: string; // 前缀，如 '¥' 或 '+'
  suffix?: string; // 后缀，如 '%'
  fallback?: string; // 当值为空时的显示文本，默认为 '--'
}

/**
 * 数字翻牌组件
 * 当数值变化时，会有翻牌动画效果
 * 支持 null/undefined 值，不会清零，而是保持上次的值或显示 fallback
 */
export function FlipNumber({ 
  value, 
  decimals = 2, 
  className,
  prefix = '',
  suffix = '',
  fallback = '--'
}: FlipNumberProps) {
  // 使用 ref 保存有效的显示值，避免清零
  const validValueRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  
  // 初始化：如果 value 是有效数字，设置初始值
  const getInitialValue = () => {
    if (value !== null && value !== undefined && !isNaN(value) && isFinite(value)) {
      validValueRef.current = value;
      isInitializedRef.current = true;
      return value;
    }
    // 如果已经有保存的值，使用保存的值
    if (validValueRef.current !== null) {
      return validValueRef.current;
    }
    // 否则返回 0，但标记为未初始化
    return 0;
  };
  
  const [displayValue, setDisplayValue] = useState(getInitialValue);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    // 只有当新值是有效数字时才更新
    if (value !== null && value !== undefined && !isNaN(value) && isFinite(value)) {
      const newValue = value;
      const currentValue = validValueRef.current ?? displayValue;
      
      // 更新 ref
      validValueRef.current = newValue;
      isInitializedRef.current = true;
      
      // 只有当值真正改变时才触发动画
      if (Math.abs(newValue - currentValue) > 0.0001) {
        setDirection(newValue > currentValue ? 'up' : 'down');
        setIsFlipping(true);
        // 增加动画时长，让翻页效果更明显（600ms 动画 + 50ms 缓冲）
        setTimeout(() => {
          setDisplayValue(newValue);
          setIsFlipping(false);
        }, 650);
      } else if (displayValue !== newValue) {
        // 值没有变化，但 displayValue 可能不同步，直接更新（不触发动画）
        setDisplayValue(newValue);
      }
    }
    // 如果新值是无效的，保持当前显示值不变（不清零）
  }, [value]);

  // 如果没有初始化过，显示 fallback
  if (!isInitializedRef.current && displayValue === 0) {
    return (
      <span className={clsx('inline-block tabular-nums font-mono', className)}>
        {fallback}
      </span>
    );
  }

  const formattedValue = displayValue.toFixed(decimals);
  
  return (
    <span
      className={clsx(
        'inline-block tabular-nums font-mono',
        isFlipping && (direction === 'up' ? 'number-flip-up' : 'number-flip-down'),
        className
      )}
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
