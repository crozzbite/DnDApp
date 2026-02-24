---
name: mobile-native
description: SkullRender Standards for Mobile Native Apps (Capacitor + Ionic).
metadata:
  version: 1.0.0
  author: SkullRender AI
  tags: [mobile, capacitor, ionic, android, ios]
---

# SKILL: Mobile Native Architecture

> [!IMPORTANT]
> **Philosophy**: Web First, Native Enhanced.
> The core application is an Angular SPA. Capacitor provides the native shell. Ionic provides the "feeling".

## 1. Technology Stack
- **Runtime**: Capacitor 7+ (Latest)
- **UI Framework**: Ionic 8+ (Modular components)
- **Build Target**: standard `web` (SPA), no SSR.

## 2. Capacitor Integration
- **Initialization**: `npx cap init [AppName] [AppId]`
- **Web Dir**: `dist/[project-name]/browser`
- **Sync**: Always run `npx cap sync` after build.

## 3. Ionic usage guidelines
- **Scope**: Use Ionic ONLY for mobile-specific interactions or structural containers that handle Safe Areas automatically.
- **Components**:
    - `<ion-header>`: Handles status bar padding.
    - `<ion-content>`: Handles native scrolling and bounce.
    - `<ion-router-outlet>`: Needed for native page transitions.
- **Styling**: Override Ionic CSS variables to match SkullRender (Black/Red).
    - `--ion-background-color: #000000;`
    - `--ion-text-color: #ffffff;`
    - `--ion-color-primary: #ff0000;`

## 4. Native Plugins (Core Set)
- `@capacitor/status-bar`: Control color and overlay.
- `@capacitor/splash-screen`: Manage launch experience.
- `@capacitor/preferences`: Native key-value storage (replaces localStorage).
- `@capacitor/haptics`: Vibration feedback for UI interactions.

## 5. Development Workflow
1. `ng build`
2. `npx cap sync`
3. `npx cap open android` or `npx cap open ios`
