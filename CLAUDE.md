# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TextForge is a beautiful, extensible rich text editor built with Tiptap and React. It's designed as a reusable library that can be installed via npm with TypeScript support and customizable typography presets.

## Architecture

### Core Components
- **Editor.tsx** - Main editor component with Tiptap integration, exports both Editor component and EditorRef type
- **index.ts** - Library entry point exporting public API
- **typography.ts** - Typography preset system with CSS variable-based font management

### Extensions System
Located in `src/extensions/`:
- **Callout.tsx** - Custom callout blocks (info, warning, success, error)
- **CustomMention.ts** - Mention system with @ syntax
- **MarkdownLink.ts** - Auto-linking for markdown-style links
- **MathInputRules.tsx** - Math equation input with KaTeX rendering

### Key Dependencies
- **Tiptap** - Core rich text editing framework
- **ProseMirror** - Underlying editor engine
- **KaTeX** - Math equation rendering
- **Lowlight** - Code syntax highlighting
- **@floating-ui/dom** - Floating UI positioning

## Development Commands

### Build Commands
- `npm run dev` - Start development server with demo
- `npm run build` - Build both library and demo
- `npm run build:lib` - Build library for distribution (runs build:types + vite build --mode lib)
- `npm run build:types` - Generate TypeScript declarations only

### Code Quality
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run preview` - Preview built demo

### Distribution
- `npm run prepublishOnly` - Automatically runs before publishing to npm

## Library Build Configuration

The project uses a dual-mode Vite configuration:
- **Development mode**: Standard React app for demo/testing
- **Library mode**: Builds ES and UMD modules with external dependencies

Key externalized dependencies include all Tiptap extensions, React, KaTeX, and Lowlight to avoid bundling conflicts.

## Typography System

Typography is managed through CSS variables and presets:
- Default fonts: Figtree (body) + Manrope (headings)
- 8 predefined preset combinations available
- Per-instance customization via `typographyPreset` or `fonts` props
- CSS variables: `--font-body` and `--font-heading`

## File Structure Patterns

- `src/components/` - Reusable UI components (MentionList, MathEditDialog)
- `src/extensions/` - Tiptap extensions and custom functionality
- `src/utils/` - Utility functions (mentionSuggestion)
- `src/types/` - TypeScript type definitions
- `dist/` - Built library output (ES, UMD, CSS, types)

## Testing & Quality Assurance

When making changes:
1. Test both development mode (`npm run dev`) and library build (`npm run build:lib`)
2. Run linting (`npm run lint`) before commits
3. Verify TypeScript compilation (`npm run build:types`)
4. Test with external dependencies as peer dependencies, not bundled

## Common Development Tasks

- **Adding new extensions**: Create in `src/extensions/`, import in Editor.tsx
- **Modifying typography**: Update `typography.ts` and CSS variables system
- **API changes**: Update exports in `src/index.ts`
- **Styling changes**: Modify `src/editor-styles.css` for editor-specific styles