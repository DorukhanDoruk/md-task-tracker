# Change Log

All notable changes to the "md-task-tracker" extension will be documented in this file.

## [0.1.3] - 2026-04-08

### Changed
- **Deterministic Task Sorting**: Improved sidebar organization by implementing a dual-sorting strategy.
    - Tasks are primarily sorted by completion percentage (descending).
    - Tasks with identical progress are now alphabetically sorted by name (ascending), ensuring a consistent UI on refresh.

## [0.1.2] - 2026-04-05

### Added
- **Premium Demo Mockup**: Added a high-quality Visual Studio Code mockup to the README.
- **Marketplace Integration**: Added a badge and official link to the extension's marketplace page.

### Changed
- **UI Refinement (Option B Alignment)**: Refactored the tree view layout to achieve superior alignment.
    - Path percentage (e.g., `82` or `✓`) is now placed as a decoration badge on the far-right of the window.
    - Task counts (e.g., `10/12`) are now clearly separated in the description field.
    - Retained high-contrast white text for file/folder names.
- **Improved Iconography**: Added color-coded status icons for folders to match the existing file decoration logic (Red -> Orange -> Yellow -> Blue -> Green checkmark).

[0.1.1] - 2026-04-03
 
### Fixed
- **Explorer Decoration Isolation**: Progress badges and colors are now isolated to the dedicated "Task Progress" view and will no longer appear in the standard VS Code Explorer.
 
## [0.1.0] - 2026-04-03

### Added
- **Exclude Files and Folders**: Right-click on any file or folder in the Task Progress view to exclude it from tracking.
- **Ignore Code Blocks**: Tasks (`[]`, `[x]`) inside inline code (\` \`) or fenced code blocks (\`\`\` \`\`\`) are now automatically ignored prevent false positives.
- **Clear All Exclusions Command**: Easily restore all hidden items using the "Clear All Exclusions" button in the view title bar.

### Changed
- Improved Task Progress view refresh logic to react to configuration changes.

## [0.0.3] - 2026-04-03

### Added
- **Task Highlighting in Editor**: Task checkboxes (`[ ]`, `[x]`, `[X]`) are now visually highlighted (with red/green background colors) when markdown files are opened from the MD Tasks panel. Highlights automatically update when the tracked file is saved.

## [0.0.2] - 2026-04-03

### Changed
- Fixed ActivityBar icon and view container configurations.

## [0.0.1] - 2026-04-03

### Added
- **Hierarchical Tree View**: Organize tasks by folders and files matching your workspace structure.
- **Flexible Checkbox Detection**: Support for `[]`, `[ ]`, and `[x]`, with or without markdown list markers.
- **Color-coded Progress**: Dynamic icons and text colors (Red -> Orange -> Green) based on completion percentage.
- **Visual Decorations**: Task completion percentage badges next to filenames and folders.
- **Automatic Refresh**: View updates immediately on markdown file save.
- **Localization**: Full English support for UI, comments, and documentation.