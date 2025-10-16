import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
      pulse: number;
    }> = [];

    // Couleurs adaptées selon le thème
    const colors = isDark 
      ? ['rgba(156, 212, 227, 0.8)', 'rgba(59, 130, 246, 0.6)', 'rgba(147, 197, 253, 0.7)']
      : ['rgba(59, 130, 246, 0.7)', 'rgba(37, 99, 235, 0.6)', 'rgba(29, 78, 216, 0.65)'];
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let animationFrame = 0;
    
    const animate = () => {
      animationFrame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Pulsing effect
        const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
        const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        
        // Gradient fill for particles
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize
        );
        gradient.addColorStop(0, particle.color.replace(/[\d\.]+\)$/g, `${pulseOpacity})`));
        gradient.addColorStop(1, particle.color.replace(/[\d\.]+\)$/g, '0)'));
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Connect nearby particles
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const baseOpacity = isDark ? 0.3 : 0.15;
            const connectionOpacity = baseOpacity * (120 - distance) / 120;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Animated connection lines
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            
            if (isDark) {
              lineGradient.addColorStop(0, `rgba(156, 212, 227, ${connectionOpacity})`);
              lineGradient.addColorStop(0.5, `rgba(59, 130, 246, ${connectionOpacity * 1.5})`);
              lineGradient.addColorStop(1, `rgba(156, 212, 227, ${connectionOpacity})`);
            } else {
              lineGradient.addColorStop(0, `rgba(59, 130, 246, ${connectionOpacity * 1.8})`);
              lineGradient.addColorStop(0.5, `rgba(37, 99, 235, ${connectionOpacity * 2})`);
              lineGradient.addColorStop(1, `rgba(29, 78, 216, ${connectionOpacity * 1.8})`);
            }
            
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 0.8 + Math.sin(animationFrame * 0.01) * 0.3;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${isDark ? 'opacity-60' : 'opacity-70'}`}
      style={{ background: 'transparent' }}
    />
  );
};