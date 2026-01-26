/**
 * @file index.ts
 * @description Barrel export for all organism components.
 * Organisms are complex UI components composed of atoms and molecules.
 */

export { Header } from "./Header";
export type { HeaderProps, NavItem } from "./Header";

export { Footer } from "./Footer";
export type { FooterProps, FooterSection, FooterLink } from "./Footer";

export { CourseCatalog } from "./CourseCatalog";
export type { CourseCatalogProps, ViewMode } from "./CourseCatalog";

export { AcuityEmbed } from "./AcuityEmbed";
export type { AcuityEmbedProps } from "./AcuityEmbed";

export { CoursePurchaseModal } from "./CoursePurchaseModal";

