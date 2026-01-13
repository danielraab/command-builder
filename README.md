<div align="center">
  <img src="public/terminal-icon.svg" alt="Terminal Icon" width="100" height="100" style="color: #22c55e;">
</div>

# Command Builder

A modern Angular application that helps you build complex shell commands through an interactive GUI interface.

## Features

✨ **Interactive Command Building**
- Visual selection of command flags and options
- Real-time command preview as you make changes
- Support for text, number, and enum parameter types

🎯 **Multiple Commands**
- Pre-configured commands: `ls`, `grep`, `find`
- Easy navigation between commands via navbar
- Extensible JSON-based command definitions

📝 **Command Examples**
- Pre-configured example commands for quick setup
- One-click application of example configurations
- Learn common command patterns

💾 **Persistent History**
- Saves your last 20 generated commands per command type
- Stored in browser's localStorage
- Timestamp tracking with relative time display

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/               # Navigation bar component
│   │   ├── home/                 # Home page component
│   │   ├── command-builder/      # Main command builder interface
│   │   └── command-history/      # Command history display
│   ├── models/
│   │   └── command.model.ts      # TypeScript interfaces for commands
│   ├── services/
│   │   └── command.service.ts    # Service for loading commands & managing history
│   └── app.routes.ts             # Application routing configuration
├── public/
│   └── commands.json             # Command definitions (single source of truth)
└── styles.css                    # Global styles
```

## Commands Configuration

All command information is stored in `/public/commands.json`. This single file contains:

- Available commands
- Flags and options with descriptions
- Parameter types (text, number, enum)
- Default selections
- Pre-configured examples

### Example Command Structure

```json
{
  "id": "ls",
  "name": "ls",
  "description": "List directory contents",
  "flags": [
    {
      "id": "long",
      "flag": "-l",
      "description": "Use a long listing format",
      "selected": true
    }
  ],
  "options": [
    {
      "id": "sort",
      "option": "--sort",
      "description": "Sort by specified criteria",
      "selected": false,
      "parameter": {
        "type": "enum",
        "enumValues": [
          { "value": "size", "label": "Size", "description": "Sort by file size" }
        ]
      }
    }
  ],
  "examples": [
    {
      "command": "ls -lah",
      "description": "List all files including hidden ones",
      "presets": {
        "long": { "selected": true },
        "all": { "selected": true }
      }
    }
  ]
}
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`

### Build

Build the project for production:
```bash
npm run build
```

### Docker Deployment

For Docker deployment instructions, see the [Docker README](docker/README.md).

## Usage

1. **Select a Command**: Click on a command in the navigation bar (e.g., `ls`, `grep`, `find`)

2. **Configure Options**:
   - Check/uncheck flags to enable/disable them
   - Select options and fill in required parameters
   - Watch the command update in real-time

3. **Use Examples**: Click "Apply Example" on any pre-configured example to quickly set up common scenarios

4. **Save to History**: Click "Save to History" to store the generated command for later reference

5. **Copy Command**: Click "Copy" to copy the generated command to your clipboard

## Adding New Commands

To add a new command, edit `/public/commands.json`:

1. Add a new command object to the `commands` array
2. Define the command's flags and options
3. Optionally add example configurations
4. The command will automatically appear in the navigation

## Technology Stack

- **Angular 21** - Latest version with standalone components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Signals** - Reactive state management
- **RxJS** - For HTTP requests
- **localStorage** - Client-side history persistence

## License

This project is open source and available under the MIT License.
