# Markdown Task Tracker

Markdown Task Tracker is a VS Code extension that helps you track your task progress across markdown files in your workspace. It provides a dedicated view in the Activity Bar to visualize your task completion status at a glance.

## Features

### 📂 Hierarchical Tree View
Tasks are organized by your workspace's folder structure. Folders aggregate the progress of all markdown files within them, helping you see the overall status of different projects or components.

### 🔍 Flexible Checkbox Detection
Works with all common markdown checkbox styles! It detects `[ ]` and `[x]` whether they are part of a standard list (`-`, `*`, `1.`) or just free-standing in your text.

### 🎨 Color-coded Progress
Visual feedback from red to green:
- **Red**: 0% completed
- **Orange/Yellow**: In progress (1% - 99%)
- **Blue**: High progress (70%+)
- **Green**: 100% completed!
Progress percentages are displayed as badges next to filenames and folders.

### 🔄 Automatic Updates
The view refreshes automatically whenever you save a markdown file, keeping your progress up to date in real-time.

## Installation

1. Open your project in VS Code.
2. Look for the **MD Tasks** icon in the Activity Bar on the left.
3. Your markdown files with checkboxes will automatically appear there.

## Extension Settings

This extension currently does not contribute any custom settings.

## Release Notes

### 0.0.1
Initial release with:
- Hierarchical folder/file tree view.
- Flexible checkbox detection.
- Color-coded progress status via File Decorations.
- English localization.

---

**Enjoy tracking your tasks!**
