import { useState, useEffect } from 'react';
import clsx from 'clsx';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      className={clsx(
        'w-10 h-10 rounded-full',
        'glass-card border border-neon-blue/50',
        'flex items-center justify-center',
        'text-neon-blue hover:text-white',
        'hover:bg-neon-blue/20 hover:border-neon-blue',
        'hover:shadow-[0_0_15px_rgba(0,212,255,0.4)]',
        'active:scale-90',
        'transition-all duration-150',
        'backdrop-blur-md'
      )}
      title="回到顶部"
    >
      <i className="ri-arrow-up-line text-lg" />
    </button>
  );
}
