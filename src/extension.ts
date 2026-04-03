import * as vscode from 'vscode';
import { MarkdownTaskProvider } from './MarkdownTaskProvider';
import { TaskDecorationProvider } from './TaskDecorationProvider';

export function activate(context: vscode.ExtensionContext) {
    const markdownTaskProvider = new MarkdownTaskProvider();

    // Register our Task Provider to the view defined in package.json
    vscode.window.registerTreeDataProvider('md-tasks-view', markdownTaskProvider);

    // Register our Decoration Provider for color/status updates
    const decorationProvider = TaskDecorationProvider.getInstance();
    context.subscriptions.push(vscode.window.registerFileDecorationProvider(decorationProvider));

    // Register a command to manually refresh the view
    let refreshCommand = vscode.commands.registerCommand('md-tasks-tracker.refresh', () => {
        markdownTaskProvider.refresh();
    });

    context.subscriptions.push(refreshCommand);
}

export function deactivate() { }