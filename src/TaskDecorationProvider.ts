import * as vscode from 'vscode';

export class TaskDecorationProvider implements vscode.FileDecorationProvider {
    private static _instance: TaskDecorationProvider;
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;

    private _progressMap: Map<string, number> = new Map();

    private constructor() {}

    public static getInstance(): TaskDecorationProvider {
        if (!TaskDecorationProvider._instance) {
            TaskDecorationProvider._instance = new TaskDecorationProvider();
        }
        return TaskDecorationProvider._instance;
    }

    updateProgress(uri: vscode.Uri, percentage: number) {
        this._progressMap.set(uri.toString(), percentage);
        this._onDidChangeFileDecorations.fire(uri);
    }

    clear() {
        this._progressMap.clear();
        this._onDidChangeFileDecorations.fire([...this._progressMap.keys()].map(k => vscode.Uri.parse(k)));
    }

    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        const percentage = this._progressMap.get(uri.toString());
        if (percentage === undefined) {
            return undefined;
        }

        let color: vscode.ThemeColor;
        let badge: string = `${percentage}%`;

        if (percentage === 100) {
            color = new vscode.ThemeColor('charts.green');
        } else if (percentage >= 70) {
            color = new vscode.ThemeColor('charts.blue');
        } else if (percentage >= 40) {
            color = new vscode.ThemeColor('charts.yellow');
        } else if (percentage > 0) {
            color = new vscode.ThemeColor('charts.orange');
        } else {
            color = new vscode.ThemeColor('charts.red');
        }

        return {
            badge: badge,
            color: color,
            tooltip: `Task Progress: ${percentage}%`
        };
    }
}
