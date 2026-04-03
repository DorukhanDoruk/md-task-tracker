import * as vscode from 'vscode';
import { MarkdownTaskProvider } from './MarkdownTaskProvider';
import { TaskDecorationProvider } from './TaskDecorationProvider';

const trackedDocuments = new Set<string>();

const completedDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 200, 0, 0.25)',
    borderRadius: '3px'
});

const uncompletedDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.25)',
    borderRadius: '3px'
});

function applyHighlights(editor: vscode.TextEditor) {
    if (!editor || !editor.document) return;
    const text = editor.document.getText();
    const regex = /\[[ xX]?\]/g;
    let match;
    const completedRanges: vscode.Range[] = [];
    const uncompletedRanges: vscode.Range[] = [];

    while ((match = regex.exec(text)) !== null) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Simple heuristic: if it has x/X it's completed
        if (match[0].includes('x') || match[0].includes('X')) {
            completedRanges.push(range);
        } else {
            uncompletedRanges.push(range);
        }
    }

    editor.setDecorations(completedDecoration, completedRanges);
    editor.setDecorations(uncompletedDecoration, uncompletedRanges);
}

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

    // Register our custom command to open and highlight tasks
    let openAndHighlightCommand = vscode.commands.registerCommand('md-tasks-tracker.openAndHighlightTasks', async (uri: vscode.Uri) => {
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc);
            trackedDocuments.add(doc.uri.toString());
            applyHighlights(editor);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
    });

    // When a document is saved, if it's tracked, re-apply highlights
    let saveSubscription = vscode.workspace.onDidSaveTextDocument((doc) => {
        if (trackedDocuments.has(doc.uri.toString())) {
            const editor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === doc.uri.toString());
            if (editor) {
                applyHighlights(editor);
            }
        }
    });

    // When closed, remove from tracking to avoid memory leaks
    let closeSubscription = vscode.workspace.onDidCloseTextDocument((doc) => {
        trackedDocuments.delete(doc.uri.toString());
    });

    context.subscriptions.push(refreshCommand, openAndHighlightCommand, saveSubscription, closeSubscription);
}

export function deactivate() {
    trackedDocuments.clear();
}