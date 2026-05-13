import type { WebsiteSiteDataSection } from "@/api/websites";
import { mapDepoimentoResponsesToTestimonialData } from "@/api/websites/components/depoimentos/normalization";
import { mapLogoEnterpriseResponsesToLogoData } from "@/api/websites/components/logo-enterprises/normalization";
import type { TestimonialData } from "@/theme/website/components/testimonials-carousel/types";
import type { LogoData } from "@/theme/website/components/logo-enterprises/types";

export type WebsiteRecord = Record<string, unknown>;

export function isWebsiteRecord(value: unknown): value is WebsiteRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asWebsiteRecordArray(value: unknown): WebsiteRecord[] {
  return Array.isArray(value) ? value.filter(isWebsiteRecord) : [];
}

export function hasSiteDataSection(
  payload: Record<string, unknown>,
  section: WebsiteSiteDataSection,
): boolean {
  return Object.prototype.hasOwnProperty.call(payload, section);
}

export function hasStaticItems(items: readonly unknown[]): boolean {
  return items.length > 0;
}

export function mapWebsiteLogos(value: unknown): LogoData[] {
  return mapLogoEnterpriseResponsesToLogoData(asWebsiteRecordArray(value), {
    assumePublishedWhenStatusMissing: true,
  });
}

export function mapWebsiteTestimonials(value: unknown): TestimonialData[] {
  return mapDepoimentoResponsesToTestimonialData(asWebsiteRecordArray(value), {
    assumePublishedWhenStatusMissing: true,
  });
}
