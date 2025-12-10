// src/theme/website/components/checkout/components/CardBrandIcon.tsx

import React from "react";
import type { CardBrand } from "../types";
import {
  VisaFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  AmericanExpressFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  EloFlatRoundedIcon,
  HipercardFlatRoundedIcon,
  DinersClubFlatRoundedIcon,
  JCBFlatRoundedIcon,
  GenericFlatRoundedIcon,
} from "react-svg-credit-card-payment-icons";

interface CardBrandIconProps {
  brand: CardBrand;
  className?: string;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({
  brand,
  className = "w-8 h-5",
}) => {
  const iconProps = { className };

  switch (brand) {
    case "visa":
      return <VisaFlatRoundedIcon {...iconProps} />;
    case "mastercard":
      return <MastercardFlatRoundedIcon {...iconProps} />;
    case "amex":
      return <AmericanExpressFlatRoundedIcon {...iconProps} />;
    case "discover":
      return <DiscoverFlatRoundedIcon {...iconProps} />;
    case "elo":
      return <EloFlatRoundedIcon {...iconProps} />;
    case "hipercard":
      return <HipercardFlatRoundedIcon {...iconProps} />;
    case "diners":
      return <DinersClubFlatRoundedIcon {...iconProps} />;
    case "jcb":
      return <JCBFlatRoundedIcon {...iconProps} />;
    default:
      return <GenericFlatRoundedIcon {...iconProps} />;
  }
};
