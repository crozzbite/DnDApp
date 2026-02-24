---
name: ui-arch
description: SkullRender Visual & Structural UI Standards.
metadata:
  version: 1.0.0
  author: SkullRender AI
---

# 🎨 SkullRender UI: The Bone Architecture (v19+)

> [!CAUTION]
> **INTERNAL USE ONLY**: This skill contains SkullRender IP (Intellectual Property). 
> **DO NOT** commit this skill or its assets to public repositories.

## 0. Branding Assets (PI - Private Intellectual Property)
- **Logo**: `src/assets/sr/logo-bones.svg` (The central skull/vertebrae symbol).
- **Icon**: `src/assets/sr/favicon-blood.ico` (The red accent favicon).
- **Background**: `src/assets/sr/void-bg.webp` (Custom neural-noise dark background).
- **Typography**: 
    - Headers: 'Outfit' (Bold)
    - Code/Data: 'JetBrains Mono' (Custom build for SR).

## 1. Design Tokens (The Skull Palette)
- **Primary**: `#000000` (Deep Bone Black)
- **Secondary**: `#FFFFFF` (Pure Marrow White)
- **Accent**: `#FF0000` (Vital Blood Red)
- **Surface**: Glassmorphism (Background blur: 12px, opacity: 0.7, border: 1px solid rgba(255,255,255,0.1))

## 2. Structural Hierarchy (The Angular Way)
Following the **Bone Hierarchy** (Clean Logic -> Structural Bones -> Technical Brain):

### Level 1: Structure (Scope Rule)
- **Core**: App-wide singletons (Auth, Interceptors, ThemeEngine).
- **Shared**: Atomic reusable UI components (Buttons, Modals, Loaders).
- **Features**: Business modules (Swarm-Control, Knowledge-Base, Audit-View).

### Level 2: Radical Naming
- No suffixes in filenames (e.g., `theme.ts` instead of `theme.service.ts`).
- Folder names determine the context.

## 3. Visual Excellence Mandate
- **Typography**: 'JetBrains Mono' for technical data, 'Outfit' for UI labels.
- **Micro-animations**: Any interactive element MUST have a subtle hover/active state (0.2s duration).
- **Responsive**: Grid-based layouts (CSS Grid) with mobile-first priority.

## 4. Performance (Skull Speed)
- **Signals**: Mandatory for all component state.
- **@defer**: Required for all non-critical heavy components (Charts, Large Maps).
- **OnPush**: Default `ChangeDetectionStrategy` for every component.

---
**STATUS: ACTIVE** 💀🦾🎨
