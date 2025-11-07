"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface DonutChartSegment {
  value: number;
  color: string; // Should be a valid CSS color (e.g., hsl(var(--primary)))
  label: string;
  [key: string]: any; // Allow other data
}

interface DonutChartComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[];
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  animationDelayPerSegment?: number;
  highlightOnHover?: boolean;
  centerContent?: React.ReactNode;
  /** Callback function when a segment is hovered */
  onSegmentHover?: (segment: DonutChartSegment | null) => void;
}

const DonutChartComponent = React.forwardRef<
  HTMLDivElement,
  DonutChartComponentProps
>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 1,
      animationDelayPerSegment = 0.05,
      highlightOnHover = true,
      centerContent,
      onSegmentHover,
      className,
      ...props
    },
    ref
  ) => {
    const [hoveredSegment, setHoveredSegment] =
      React.useState<DonutChartSegment | null>(null);

    const internalTotalValue = React.useMemo(
      () =>
        propTotalValue || data.reduce((sum, segment) => sum + segment.value, 0),
      [data, propTotalValue]
    );

    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate segments with cumulative offsets
    const segments = React.useMemo(() => {
      let cumulativePercentage = 0;
      return data
        .filter((segment) => segment.value > 0)
        .map((segment) => {
          const percentage =
            internalTotalValue === 0
              ? 0
              : (segment.value / internalTotalValue) * 100;

          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = (cumulativePercentage / 100) * circumference;

          cumulativePercentage += percentage;

          return {
            ...segment,
            percentage,
            strokeDasharray,
            strokeDashoffset,
          };
        });
    }, [data, internalTotalValue, circumference]);

    // Effect to call the onSegmentHover prop when internal state changes
    React.useEffect(() => {
      onSegmentHover?.(hoveredSegment);
    }, [hoveredSegment, onSegmentHover]);

    const handleMouseLeave = () => {
      setHoveredSegment(null);
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible -rotate-90" // Rotate to start at 12 o'clock
        >
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb" // Light gray background ring
            strokeWidth={strokeWidth}
            strokeOpacity={0.3}
          />

          {/* Data Segments */}
          <AnimatePresence>
            {segments.map((segment, index) => {
              const isActive = hoveredSegment?.label === segment.label;

              return (
                <motion.circle
                  key={segment.label || index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={-segment.strokeDashoffset} // Negative offset to draw correctly
                  strokeLinecap="round" // Makes rounded edges
                  initial={{ opacity: 0, strokeDashoffset: circumference }}
                  animate={{
                    opacity: 1,
                    strokeDashoffset: -segment.strokeDashoffset,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.3,
                      delay: index * animationDelayPerSegment,
                    },
                    strokeDashoffset: {
                      duration: animationDuration,
                      delay: index * animationDelayPerSegment,
                      ease: "easeOut",
                    },
                  }}
                  className={cn(
                    "origin-center transition-transform duration-200",
                    highlightOnHover && "cursor-pointer"
                  )}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0px 0px 8px ${segment.color}88) brightness(1.08)`
                      : "none",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                    transition:
                      "filter 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={() => setHoveredSegment(segment)}
                />
              );
            })}
          </AnimatePresence>
        </svg>
        {/* Center Content */}
        {centerContent && (
          <div
            className="absolute flex flex-col items-center justify-center pointer-events-none"
            style={{
              width: size - strokeWidth * 2.5, // Ensure content fits inside
              height: size - strokeWidth * 2.5,
            }}
          >
            {centerContent}
          </div>
        )}
      </div>
    );
  }
);

DonutChartComponent.displayName = "DonutChartComponent";

export { DonutChartComponent };
