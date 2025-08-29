"use client";

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  speed?: 'slow' | 'medium' | 'fast';
  children?: React.ReactNode;
}

export default function AnimatedBackground({
  className,
  intensity = 'light',
  speed = 'medium',
  children
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const config = useMemo(() => {
    const intensityMap = {
      light: { count: 15, size: [1, 2], opacity: 0.1 },
      medium: { count: 25, size: [1, 3], opacity: 0.15 },
      strong: { count: 40, size: [1, 4], opacity: 0.2 },
    };
    
    const speedMap = {
      slow: { velocity: 0.2 },
      medium: { velocity: 0.5 },
      fast: { velocity: 0.8 },
    };
    
    return {
      ...intensityMap[intensity],
      ...speedMap[speed],
    };
  }, [intensity, speed]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
    }[] = [];
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      
      // Regenerate particles after resize
      initParticles();
    };
    
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < config.count; i++) {
        const size = Math.random() * (config.size[1] - config.size[0]) + config.size[0];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          vx: (Math.random() - 0.5) * config.velocity,
          vy: (Math.random() - 0.5) * config.velocity,
        });
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = `rgba(var(--primary-rgb), ${config.opacity})`;
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    // Set up canvas and start animation
    resizeCanvas();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [config]);
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10"
        style={{ opacity: 0.7 }}
      />
      {children}
    </div>
  );
}