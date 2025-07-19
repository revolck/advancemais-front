"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatNumber, animateValue, isElementVisible } from "../utils";
import { COUNTER_CONFIG } from "../constants";
import type { CounterItemProps } from "../types";

export const CounterItem: React.FC<CounterItemProps> = ({
  data,
  animated = true,
  animationDuration = COUNTER_CONFIG.animation.defaultDuration,
  index,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : data.value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const cancelAnimationRef = useRef<(() => void) | null>(null);

  // Função para iniciar animação
  const startAnimation = () => {
    if (!animated || hasAnimated) return;

    const delay = index * COUNTER_CONFIG.animation.delay;

    setTimeout(() => {
      if (cancelAnimationRef.current) {
        cancelAnimationRef.current();
      }

      cancelAnimationRef.current = animateValue(
        0,
        data.value,
        animationDuration,
        (value) => setDisplayValue(Math.floor(value)),
        () => {
          setDisplayValue(data.value);
          setHasAnimated(true);
        }
      );
    }, delay);
  };

  // Observer para detectar quando o elemento fica visível
  useEffect(() => {
    if (!animated || hasAnimated || !elementRef.current) return;

    const element = elementRef.current;

    if (isElementVisible(element)) {
      setIsVisible(true);
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            startAnimation();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (cancelAnimationRef.current) {
        cancelAnimationRef.current();
      }
    };
  }, [animated, hasAnimated, data.value, index, animationDuration]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (cancelAnimationRef.current) {
        cancelAnimationRef.current();
      }
    };
  }, []);

  const formattedValue = formatNumber(displayValue, {
    decimals: COUNTER_CONFIG.display.decimals,
    useGroupingSeparator: COUNTER_CONFIG.display.useGroupingSeparator,
    locale: COUNTER_CONFIG.display.locale,
    compact: COUNTER_CONFIG.display.compact,
  });

  return (
    <div
      ref={elementRef}
      className="text-center flex-1 min-w-[180px] md:min-w-[200px] flex flex-col gap-2"
      style={{
        opacity: hasAnimated || !animated || isVisible ? 1 : 0,
        transform:
          hasAnimated || !animated || isVisible
            ? "translateY(0)"
            : "translateY(30px)",
        transition: `all 0.4s ease-out ${index * 0.05}s`,
      }}
    >
      {/* Valor principal - CLASSES DIRETAS */}
      <div className="relative">
        <h1 className="!text-5xl !sm:text-6xl !md:text-7xl !lg:text-8xl !xl:text-9xl !font-bold text-red-500 !mb-0 leading-none transition-all duration-300">
          {data.prefix}
          {formattedValue}
          {data.suffix}
        </h1>
      </div>

      {/* Descrição - CLASSES DIRETAS */}
      <p className="uppercase !text-sm md:text-xl lg:text-2xl !text-white font-light leading-tight">
        {data.description}
      </p>
    </div>
  );
};
