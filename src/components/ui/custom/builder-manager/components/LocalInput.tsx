import React, { useState, useRef, useEffect } from "react";

interface LocalInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Componente de input com estado local para evitar perda de foco
 * Sincroniza com o valor externo apenas no blur ou quando o input não está focado
 */
export function LocalInput({
  value,
  onChange,
  className,
  placeholder,
}: LocalInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza valor externo quando muda (mas não durante digitação)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      className={className}
      value={localValue}
      placeholder={placeholder}
      onChange={(e) => {
        e.stopPropagation();
        setLocalValue(e.target.value);
      }}
      onBlur={() => {
        if (localValue !== value) {
          onChange(localValue);
        }
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
    />
  );
}

