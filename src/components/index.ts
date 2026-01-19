/**
 * @file index.ts
 * @description Main barrel export for all components.
 * Import from this file for cleaner imports across the application.
 *
 * @example
 * import { Button, Input, Hero, Header, Footer } from "@/components";
 */

// Atoms - smallest, most reusable building blocks
export * from "./atoms";

// Molecules - combinations of atoms
export * from "./molecules";

// Organisms - complex UI components
export * from "./organisms";
