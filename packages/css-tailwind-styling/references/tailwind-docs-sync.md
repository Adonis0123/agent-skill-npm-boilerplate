# Tailwind CSS Documentation Sync

This file tracks the latest Tailwind CSS documentation references for annual updates.

## Official Documentation Links

**Last Updated**: 2025-01

### Core Documentation
- [Tailwind CSS Official Docs](https://tailwindcss.com/docs) - Main documentation
- [Installation Guide](https://tailwindcss.com/docs/installation)
- [Configuration](https://tailwindcss.com/docs/configuration)
- [Customization](https://tailwindcss.com/docs/theme)

### Best Practices
- [Reusing Styles](https://tailwindcss.com/docs/reusing-styles)
- [Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Functions & Directives](https://tailwindcss.com/docs/functions-and-directives)
- [Optimizing for Production](https://tailwindcss.com/docs/optimizing-for-production)

### Modern Features (2024+)
- [Container Queries](https://tailwindcss.com/docs/hover-focus-and-other-states#container-queries) - Browser support ~92%
- [Arbitrary Variants](https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants)
- [Dynamic Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Plugins
- [Official Plugins](https://tailwindcss.com/docs/plugins)
- [Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- [Forms Plugin](https://github.com/tailwindlabs/tailwindcss-forms)
- [Aspect Ratio Plugin](https://github.com/tailwindlabs/tailwindcss-aspect-ratio)
- [Line Clamp Plugin](https://github.com/tailwindlabs/tailwindcss-line-clamp)

### Tools & Integrations
- [Prettier Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) - Auto-sort classes
- [ESLint Plugin](https://github.com/francoismassart/eslint-plugin-tailwindcss) - Lint Tailwind classes
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - IntelliSense
- [Headless UI](https://headlessui.com/) - Unstyled accessible components
- [Heroicons](https://heroicons.com/) - SVG icons

## Version Compatibility

### Tailwind CSS v3+ (Current)
- JIT mode enabled by default
- Arbitrary value support (`w-[123px]`)
- Native aspect ratio utilities
- Accent color utilities
- Scroll snap utilities
- Multi-column layout utilities

### Breaking Changes from v2 to v3
- Colors no longer include default opacity modifiers
- Gray renamed to slate/zinc/neutral/stone
- Overflow overlay removed
- Transform, filter, backdrop-filter removed (enabled by default)

## Browser Support (2025)

| Feature | Support | Notes |
|---------|---------|-------|
| CSS Grid | 97% | Safe to use |
| Custom Properties | 97% | Safe to use |
| Flexbox | 99% | Safe to use |
| Container Queries | 92% | Use with fallback |
| `:has()` selector | 89% | Progressive enhancement |
| Subgrid | 75% | Use with caution |

Source: [Can I Use](https://caniuse.com/)

## Annual Update Checklist

When updating this skill annually (recommended: every January):

### 1. Documentation Review
- [ ] Review Tailwind CSS release notes for the past year
- [ ] Check for new utility classes
- [ ] Verify deprecated features
- [ ] Update configuration examples if syntax changed

### 2. Browser Compatibility
- [ ] Update browser support percentages from Can I Use
- [ ] Review new CSS features adopted by Tailwind
- [ ] Check container query and modern CSS support

### 3. Tools & Ecosystem
- [ ] Verify Prettier plugin compatibility
- [ ] Check ESLint plugin updates
- [ ] Review new official plugins
- [ ] Update VS Code extension recommendations

### 4. Best Practices
- [ ] Review Tailwind blog for new recommendations
- [ ] Check community best practices (GitHub, Twitter, Discord)
- [ ] Update performance optimization techniques
- [ ] Verify accessibility guidelines (WCAG updates)

### 5. Examples & Code
- [ ] Test all code examples with latest Tailwind version
- [ ] Update deprecated class names
- [ ] Add examples for new features
- [ ] Remove outdated workarounds

## Community Resources

### Official
- [Tailwind Blog](https://tailwindcss.com/blog)
- [Tailwind Discord](https://tailwindcss.com/discord)
- [Tailwind GitHub](https://github.com/tailwindlabs/tailwindcss)

### Learning
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground
- [Tailwind UI](https://tailwindui.com/) - Official component library (paid)
- [Tailwind Components](https://tailwindcomponents.com/) - Community components
- [Awesome Tailwind CSS](https://github.com/aniftyco/awesome-tailwindcss) - Curated list

### Blogs & Tutorials
- [Adam Wathan (Creator)](https://twitter.com/adamwathan)
- [Tailwind CSS Weekly](https://tailwindcss.com/blog)
- [Tailwind Strategies](https://www.youtube.com/@TailwindLabs)

## Migration Guide Template

When Tailwind releases a major version:

```bash
# Install latest version
npm install -D tailwindcss@latest

# Update PostCSS config if needed
# Update tailwind.config.js

# Run codemod (if available)
npx @tailwindcss/upgrade

# Check for breaking changes
# Review release notes: https://github.com/tailwindlabs/tailwindcss/releases

# Test build
npm run build

# Fix deprecation warnings
# Update custom plugin code if applicable
```

## Notes for Skill Maintainers

- Keep SKILL.md under 2,000 words by moving detailed content here
- Update this file annually in January
- Add new sections as Tailwind evolves
- Document breaking changes prominently
- Maintain backward compatibility examples when possible
