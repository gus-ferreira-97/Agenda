import type { ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

interface RevealProps {
  children: ReactNode;
  delay?: number; // 100, 200, 300, 400, 500
  className?: string;
  variant?: 'up' | 'in';
}

export default function Reveal({
  children,
  delay = 0,
  className = '',
  variant = 'up',
}: RevealProps) {
  const { ref, isInView } = useInView();

  const animationClass = variant === 'up' ? 'animate-fade-in-up' : 'animate-fade-in';
  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={isInView ? `${animationClass} ${delayClass} ${className}` : `opacity-0 ${className}`}
    >
      {children}
    </div>
  );
}