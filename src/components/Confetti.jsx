import React, { useEffect } from 'react';

export default function Confetti({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      createConfetti();
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  const createConfetti = () => {
    const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.opacity = '1';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.transition = 'all 3s ease-out';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.borderRadius = '50%';

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.style.top = window.innerHeight + 'px';
        confetti.style.left = (parseInt(confetti.style.left) + (Math.random() - 0.5) * 200) + 'px';
        confetti.style.opacity = '0';
        confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
      }, 10);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  return null;
}
