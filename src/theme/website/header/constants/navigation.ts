import React from "react";
import { ExternalLinkIcon } from "../icons";
import type { NavigationItem } from "../types";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: "product",
    label: "Product",
    href: "#",
    type: "link",
  },
  {
    key: "customers",
    label: "Customers",
    href: "#",
    type: "link",
  },
  {
    key: "channels",
    label: "Channels",
    href: "#",
    type: "dropdown",
    items: [
      { label: "Slack", href: "#" },
      { label: "Microsoft Teams", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Email", href: "#" },
      { label: "Web Chat", href: "#" },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    href: "#",
    type: "dropdown",
    items: [
      { label: "Blog", href: "#", icon: React.createElement(ExternalLinkIcon) },
      { label: "Guides", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    key: "docs",
    label: "Docs",
    href: "#",
    type: "link",
  },
  {
    key: "pricing",
    label: "Pricing",
    href: "#",
    type: "link",
  },
];
