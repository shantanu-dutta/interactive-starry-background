import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

import './StarScape.css';

const StarScape = ({
  densityRatio = 0.5,
  sizeLimit = 5,
  defaultAlpha = 0.2,
  scaleLimit = 2,
  proximityRatio = 0.1,
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const starsRef = useRef([]);
  const vMinRef = useRef(0);
  const scaleMapperRef = useRef(null);
  const alphaMapperRef = useRef(null);

  const load = () => {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    vMinRef.current = Math.min(window.innerHeight, window.innerWidth);
    const starCount = Math.floor(vMinRef.current * densityRatio);

    const maxRange = vMinRef.current * proximityRatio;
    scaleMapperRef.current = gsap.utils.mapRange(0, maxRange, scaleLimit, 1);
    alphaMapperRef.current = gsap.utils.mapRange(0, maxRange, 1, defaultAlpha);

    starsRef.current = new Array(starCount).fill().map(() => ({
      x: gsap.utils.random(0, window.innerWidth, 1),
      y: gsap.utils.random(0, window.innerHeight, 1),
      size: gsap.utils.random(1, sizeLimit, 1),
      scale: 1,
      alpha: gsap.utils.random(0.1, defaultAlpha, 0.1),
    }));
  };

  const render = () => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    starsRef.current.forEach(({ x, y, scale, size, alpha }) => {
      contextRef.current.fillStyle = `hsla(0, 100%, 100%, ${alpha})`;
      contextRef.current.beginPath();
      contextRef.current.arc(x, y, (size / 2) * scale, 0, Math.PI * 2);
      contextRef.current.fill();
    });
  };

  const update = ({ x, y }) => {
    starsRef.current.forEach((star) => {
      const distance = Math.sqrt(
        Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2)
      );

      const maxRange = vMinRef.current * proximityRatio;

      gsap.to(star, {
        scale: scaleMapperRef.current(Math.min(distance, maxRange)),
        alpha: alphaMapperRef.current(Math.min(distance, maxRange)),
      });
    });
  };

  const reset = () => {
    gsap.to(starsRef.current, {
      scale: 1,
      alpha: defaultAlpha,
    });
  };

  useEffect(() => {
    contextRef.current = canvasRef.current.getContext('2d');

    load();

    gsap.ticker.fps(24);
    gsap.ticker.add(render);

    window.addEventListener('resize', load);
    document.addEventListener('pointermove', update);
    document.addEventListener('pointerleave', reset);

    return () => {
      window.removeEventListener('resize', load);
      document.removeEventListener('pointermove', update);
      document.removeEventListener('pointerleave', reset);
      gsap.ticker.remove(render);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default StarScape;
