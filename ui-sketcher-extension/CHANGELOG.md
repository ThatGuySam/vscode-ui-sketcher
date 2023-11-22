# Change Log

## [Unreleased] - 2023-22-09

### Added

- Display a preview iframe with the `ui-sketcher.previewUrl` setting
- Render selection only by enabling the `ui-sketcher.partialRenderEnabled` setting
- Panel will close if the active file is closed (state remains saved)
- Opening the panel from a different file will reopen the webview with the new file
- If shapes are selected, the "Make real" button will only use those shapes
- Min 3s loading by default on "Make real" button to prevent double click
- UI Sketcher icon on canvas panels

### Changed

- Use `vscode.workspace.getWorkspaceFolder` to find the active file workspace folder
- Canvas state is now based on the file currently opened in the editor

### Fixed

- Reveal panel if already opened

### Removed

- `ui-sketcher.includeFileInPrompt` setting

## [1.0.5] - 2023-21-09

### Added

- User prompt now contains the relative path to the file based on the current workspace folder

### Fixed

- "Make real" button's position is now responsive

## [1.0.0] - 2023-11-09

- Initial release
