// src/theme/website/components/checkout/components/CardBrandIcon.tsx

import React from "react";
import type { CardBrand } from "../types";

interface CardBrandIconProps {
  brand: CardBrand;
  className?: string;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({
  brand,
  className = "w-8 h-5",
}) => {
  switch (brand) {
    case "visa":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#1A1F71" />
          <path
            d="M19.5 21H17L18.8 11H21.3L19.5 21ZM15.2 11L12.8 18L12.5 16.5L11.6 12C11.6 12 11.5 11 10.2 11H6.1L6 11.2C6 11.2 7.5 11.5 9.2 12.5L11.4 21H14L18 11H15.2ZM35.5 21H38L35.8 11H33.8C32.7 11 32.4 11.9 32.4 11.9L28.5 21H31.2L31.7 19.5H35L35.5 21ZM32.5 17.5L34 13.5L34.8 17.5H32.5ZM29 14L29.4 11.5C29.4 11.5 28 11 26.5 11C24.9 11 21.5 11.7 21.5 14.7C21.5 17.5 25.5 17.5 25.5 19C25.5 20.5 22 20.2 20.7 19.2L20.3 21.8C20.3 21.8 21.7 22.5 23.8 22.5C25.9 22.5 28.8 21.3 28.8 18.5C28.8 15.6 24.8 15.3 24.8 14C24.8 12.7 27.3 12.9 29 14Z"
            fill="white"
          />
        </svg>
      );
    case "mastercard":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#F5F5F5" />
          <circle cx="19" cy="16" r="9" fill="#EB001B" />
          <circle cx="29" cy="16" r="9" fill="#F79E1B" />
          <path
            d="M24 9.5C25.9 11 27.2 13.3 27.2 16C27.2 18.7 25.9 21 24 22.5C22.1 21 20.8 18.7 20.8 16C20.8 13.3 22.1 11 24 9.5Z"
            fill="#FF5F00"
          />
        </svg>
      );
    case "elo":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#000" />
          <path
            d="M12 16C12 13.2 14.2 11 17 11C18.5 11 19.8 11.7 20.7 12.8L18.5 14.5C18.1 14 17.6 13.7 17 13.7C15.7 13.7 14.7 14.7 14.7 16C14.7 17.3 15.7 18.3 17 18.3C17.6 18.3 18.1 18 18.5 17.5L20.7 19.2C19.8 20.3 18.5 21 17 21C14.2 21 12 18.8 12 16Z"
            fill="#FFCB05"
          />
          <path d="M22 11H24.5V21H22V11Z" fill="#00A4E0" />
          <path
            d="M26 16C26 13.2 28.2 11 31 11C33.8 11 36 13.2 36 16C36 18.8 33.8 21 31 21C28.2 21 26 18.8 26 16ZM33.3 16C33.3 14.7 32.3 13.7 31 13.7C29.7 13.7 28.7 14.7 28.7 16C28.7 17.3 29.7 18.3 31 18.3C32.3 18.3 33.3 17.3 33.3 16Z"
            fill="#EF4123"
          />
        </svg>
      );
    case "amex":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#006FCF" />
          <path
            d="M8 16L10 11H12.5L14.5 16L16.5 11H19L15 21H12.5L10.5 16L8.5 21H6L8 16ZM20 11H27V13H22.5V14.5H27V16.5H22.5V18H27V21H20V11ZM28 11H31L33 14L35 11H38L34.5 16L38 21H35L33 18L31 21H28L31.5 16L28 11ZM39 11H42V21H39V11Z"
            fill="white"
          />
        </svg>
      );
    case "hipercard":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#B3131B" />
          {/* H do Hipercard */}
          <path d="M12 9H16V14H20V9H24V23H20V17H16V23H12V9Z" fill="white" />
          {/* Círculo amarelo com centro vermelho */}
          <circle cx="34" cy="16" r="7" fill="#FFCB05" />
          <circle cx="34" cy="16" r="4" fill="#B3131B" />
        </svg>
      );
    case "diners":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#0079BE" />
          <circle cx="24" cy="16" r="9" fill="white" />
          <path
            d="M20 11V21M28 11V21M17 14H31M17 18H31"
            stroke="#0079BE"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "discover":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#F5F5F5" />
          <path d="M6 16H42" stroke="#F47216" strokeWidth="8" />
          <circle cx="30" cy="16" r="6" fill="#F47216" />
          <text x="10" y="19" fill="#000" fontSize="8" fontWeight="bold">
            DISCOVER
          </text>
        </svg>
      );
    case "jcb":
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#F5F5F5" />
          <rect x="8" y="8" width="10" height="16" rx="2" fill="#0E4C96" />
          <rect x="19" y="8" width="10" height="16" rx="2" fill="#E21836" />
          <rect x="30" y="8" width="10" height="16" rx="2" fill="#00A94F" />
          <text x="10" y="18" fill="white" fontSize="5" fontWeight="bold">
            J
          </text>
          <text x="21" y="18" fill="white" fontSize="5" fontWeight="bold">
            C
          </text>
          <text x="32" y="18" fill="white" fontSize="5" fontWeight="bold">
            B
          </text>
        </svg>
      );
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="48" height="32" rx="4" fill="#E5E7EB" />
          <rect x="8" y="10" width="32" height="4" rx="1" fill="#9CA3AF" />
          <rect x="8" y="18" width="20" height="4" rx="1" fill="#9CA3AF" />
        </svg>
      );
  }
};

