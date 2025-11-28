# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-28

### Added
- Initial release of Command Builder
- Interactive GUI for building shell commands (`ls`, `grep`, `find`)
- Real-time command preview as options are selected
- Support for three parameter types: text, number, and enum
- Command history feature that saves last 20 commands per command type
- Local storage persistence for command history
- Timestamp tracking with relative time display
- Pre-configured command examples with one-click application
- Copy to clipboard functionality
- Navigation bar for switching between commands
- Responsive design with Tailwind CSS
- WCAG AA accessibility compliance
- JSON-based command definitions in `/public/commands.json`
- Angular 20 with standalone components
- Signals-based reactive state management
- Server-side rendering (SSR) support

### Features
- **Command Builder Component**: Visual selection of flags and options
- **Command History Component**: Display and manage saved commands
- **Home Component**: Landing page with project overview
- **Navbar Component**: Command navigation
- **Footer Component**: Application footer
- **Command Service**: Loads commands from JSON and manages history

### Technical Stack
- Angular 21.0.0
- TypeScript 5.9.2
- Tailwind CSS 4.1.12
- RxJS 7.8.0
- Express 5.1.0
- Vitest 4.0.8

[Unreleased]: https://github.com/danielraab/command-builder/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/danielraab/command-builder/releases/tag/v0.1.0
