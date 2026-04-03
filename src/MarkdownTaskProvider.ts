import * as vscode from 'vscode';
import * as path from 'path';
import { TaskDecorationProvider } from './TaskDecorationProvider';

export class MarkdownTaskProvider implements vscode.TreeDataProvider<TaskItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined | void> = new vscode.EventEmitter<TaskItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {
        // Refresh automatically when a file is saved or configuration changed
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.fileName.endsWith('.md')) {
                this.refresh();
            }
        });

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('mdTaskTracker.excludePaths')) {
                this.refresh();
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TaskItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TaskItem): Promise<TaskItem[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return [];
        }

        if (element) {
            return element.children;
        }

        // Get all md files in the workspace
        const mdFiles = await vscode.workspace.findFiles('**/*.md', '**/node_modules/**');
        const excludePaths = vscode.workspace.getConfiguration('mdTaskTracker').get<string[]>('excludePaths') || [];
        
        const rootItems: TaskItem[] = [];
        const itemMap = new Map<string, TaskItem>();

        for (const file of mdFiles) {
            const relativePath = vscode.workspace.asRelativePath(file);
            
            // Check if file or any parent folder is excluded
            if (this.isExcluded(relativePath, excludePaths)) {
                continue;
            }

            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();
            
            // Filter out code blocks before counting
            const strippedText = this.stripCode(text);

            // Flexible regex: finds [], [ ], [x], or [X] with any or no prefix
            const totalMatch = strippedText.match(/\[[ xX]?\]/g);
            const completedMatch = strippedText.match(/\[[xX]\]/g);

            const total = totalMatch ? totalMatch.length : 0;
            const completed = completedMatch ? completedMatch.length : 0;

            if (total > 0) {
                const percentage = Math.round((completed / total) * 100);
                const relativePath = vscode.workspace.asRelativePath(file);
                const parts = relativePath.split(/[\\\/]/);
                
                let currentPath = '';
                let parent: FolderItem | undefined;

                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    currentPath = currentPath ? path.join(currentPath, part) : part;

                    let folderItem = itemMap.get(currentPath) as FolderItem;
                    if (!folderItem) {
                        const folderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, currentPath);
                        folderItem = new FolderItem(part, folderUri);
                        itemMap.set(currentPath, folderItem);
                        if (parent) {
                            parent.addChild(folderItem);
                        } else {
                            rootItems.push(folderItem);
                        }
                    }
                    parent = folderItem;
                }

                const fileItem = new MarkdownFileItem(file, percentage, total, completed);
                if (parent) {
                    parent.addChild(fileItem);
                } else {
                    rootItems.push(fileItem);
                }
                
                // Update decoration provider
                TaskDecorationProvider.getInstance().updateProgress(file, percentage);
            }
        }

        // Calculate aggregate progress for folders and remove duplicate roots
        const finalRoots = rootItems.filter(item => {
            if (item instanceof FolderItem) {
                item.calculateProgress();
            }
            return true;
        });

        // Filter out items that are already children of another folder in the rootItems
        // Actually, my logic above already handles folders and files correctly.
        // Let's ensure only top-level items are in rootItems.
        // The loop above adds to rootItems only if parent is undefined.
        
        return finalRoots.sort((a, b) => b.percentage - a.percentage);
    }

    private isExcluded(relativePath: string, excludePaths: string[]): boolean {
        return excludePaths.some(excludePath => {
            const normalizedRelative = relativePath.replace(/\\/g, '/');
            const normalizedExclude = excludePath.replace(/\\/g, '/');
            return normalizedRelative === normalizedExclude || normalizedRelative.startsWith(normalizedExclude + '/');
        });
    }

    private stripCode(text: string): string {
        // Replace fenced code blocks with empty space to preserve length if needed, 
        // but here we just need to skip content.
        let stripped = text.replace(/```[\s\S]*?```/g, (match) => ' '.repeat(match.length));
        // Replace inline code
        stripped = stripped.replace(/`[^`\n]+?`/g, (match) => ' '.repeat(match.length));
        return stripped;
    }
}

export abstract class TaskItem extends vscode.TreeItem {
    public children: TaskItem[] = [];
    public percentage: number = 0;

    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    addChild(child: TaskItem) {
        this.children.push(child);
    }
}

class FolderItem extends TaskItem {
    constructor(folderName: string, uri: vscode.Uri) {
        super(folderName, vscode.TreeItemCollapsibleState.Expanded);
        this.resourceUri = uri;
        this.iconPath = vscode.ThemeIcon.Folder;
    }

    calculateProgress() {
        let totalTasks = 0;
        let completedTasks = 0;

        const visit = (item: TaskItem) => {
            if (item instanceof MarkdownFileItem) {
                totalTasks += item.total;
                completedTasks += item.completed;
            } else if (item instanceof FolderItem) {
                item.calculateProgress();
                for (const child of item.children) {
                    visit(child);
                }
            }
        };

        for (const child of this.children) {
            if (child instanceof MarkdownFileItem) {
                totalTasks += child.total;
                completedTasks += child.completed;
            } else if (child instanceof FolderItem) {
                child.calculateProgress();
                // We should be careful not to double count.
                // Each FileItem is unique in our current tree building logic.
                visit(child);
            }
        }

        // Re-visiting children might double count.
        // Let's use a simpler way: Folder progress is average of direct children for simplicity,
        // or sum of all contained tasks. Let's do sum of all contained tasks.
        
        // Wait, my visit logic above might be double counting because I call calculateProgress recursively.
        // Let's just sum all FileItems under this folder.
        
        totalTasks = 0;
        completedTasks = 0;
        const allFiles: MarkdownFileItem[] = [];
        const collectFiles = (item: TaskItem) => {
            if (item instanceof MarkdownFileItem) {
                allFiles.push(item);
            } else {
                item.children.forEach(collectFiles);
            }
        };
        this.children.forEach(collectFiles);
        
        allFiles.forEach(f => {
            totalTasks += f.total;
            completedTasks += f.completed;
        });

        this.percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        this.description = `${completedTasks}/${totalTasks} (${this.percentage}%)`;
        this.tooltip = `${this.label}: ${completedTasks}/${totalTasks} tasks completed`;
        
        // Highlight folders too
        if (this.resourceUri) {
            TaskDecorationProvider.getInstance().updateProgress(this.resourceUri, this.percentage);
        }
        
        this.children.sort((a, b) => b.percentage - a.percentage);
    }
}

class MarkdownFileItem extends TaskItem {
    constructor(
        public readonly uri: vscode.Uri,
        public readonly percentage: number,
        public readonly total: number,
        public readonly completed: number
    ) {
        const fileName = path.basename(uri.fsPath);
        super(fileName, vscode.TreeItemCollapsibleState.None);

        this.label = `[ ${percentage}% ] ${fileName}`;
        this.tooltip = `${fileName} - ${completed}/${total} tasks completed`;
        this.description = `${completed}/${total}`;
        this.resourceUri = uri;

        // Visual icon based on progress
        this.iconPath = new vscode.ThemeIcon(
            percentage === 100 ? 'pass-filled' : 'circle-large-outline',
            new vscode.ThemeColor(percentage === 100 ? 'charts.green' : percentage > 0 ? 'charts.orange' : 'charts.red')
        );

        this.command = {
            command: 'md-tasks-tracker.openAndHighlightTasks',
            title: 'Open File with Highlights',
            arguments: [this.uri]
        };
    }
}