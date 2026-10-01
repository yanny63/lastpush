import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  return null;
}