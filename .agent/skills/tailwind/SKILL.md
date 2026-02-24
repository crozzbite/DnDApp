---
name: tailwind
description: SkullRender standards for Tailwind CSS usage in Angular projects.
---

# 💨 Tailwind CSS - The SkullRender Way

We use Tailwind CSS to strictly enforce our design system ("The Bone Palette") without polluting our HTML with arbitrary numbers.

## 1. Principles

1.  **Configuration-Driven**: Never use arbitrary values (e.g., `text-[13px]`). If it's not in `tailwind.config.js`, it doesn't exist.
2.  **Semantic Colors**: Use our named tokens (`sr-void`, `sr-blood`, `phy-ether`) instead of generic colors (`black`, `red-500`, `purple-600`).
3.  **Component Encapsulation**: 
    *   For **Layouts** and **Utility wrappers**: Use Tailwind utility classes directly.
    *   For **Complex Components**: Use `@apply` inside the component's CSS/SCSS file if the HTML becomes unreadable (> 5 classes per element).
4.  **No Arbitrary Margins**: Use the standard spacing scale.

## 2. Configuration (`tailwind.config.js`)

Ensure strictly defined brand colors and fonts:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'sr-void': '#000000',     // Deep Bone Black
        'sr-marrow': '#FFFFFF',   // Bone White
        'sr-blood': '#FF0000',    // Arterial Red
        'sr-blood-dim': '#8a0000',
        'phy-ether': '#8A2BE2',   // Phylactery Purple
        'phy-ether-dim': '#4b0082',
        'phy-toxic': '#b026ff',
      },
      fontFamily: {
        'ui': ['Outfit', 'sans-serif'],
        'tech': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glass-shimmer': 'shimmer 2s linear infinite',
      }
    },
  },
}
```

## 3. Usage Examples

### ✅ Correct (Semantic)
```html
<div class="bg-sr-void text-sr-marrow font-ui p-4 border border-sr-blood">
  <span class="text-phy-ether font-tech">SYSTEM.READY</span>
</div>
```

### ❌ Incorrect (Arbitrary)
```html
<div class="bg-[#000000] text-white p-[15px] border-red-500">
  <span class="text-purple-600">Bad Code</span>
</div>
```

## 4. Glassmorphism Utility
We define a standard `.glass-panel` utility in `styles.css`:
```css
@layer components {
  .glass-panel {
    @apply bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl;
  }
}
```
