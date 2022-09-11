import { App, MarkdownView, Vault, Workspace, WorkspaceLeaf } from "obsidian";

interface UnsafeAppInterface {
  internalPlugins: {
    plugins: {
      starred: {
        instance: {
          items: { path: string }[];
        };
      };
    };
  };
  commands: {
    removeCommand(id: string): void;
    commands: { [commandId: string]: any };
  };
  plugins: {
    plugins: {
      "obsidian-hover-editor"?: {
        spawnPopover(
          initiatingEl?: HTMLElement,
          onShowCallback?: () => unknown
        ): WorkspaceLeaf;
      };
    };
  };
  vault: Vault & {
    config: {
      newFileLocation?: "root" | "current" | "folder";
      newFileFolderPath?: string;
    };
  };
  workspace: Workspace & {
    openPopoutLeaf(): WorkspaceLeaf;
  };
}

export class AppHelper {
  private unsafeApp: App & UnsafeAppInterface;

  constructor(app: App) {
    this.unsafeApp = app as any;
  }

  getMarkdownViewInActiveLeaf(): MarkdownView | null {
    if (!this.unsafeApp.workspace.getActiveViewOfType(MarkdownView)) {
      return null;
    }

    return this.unsafeApp.workspace.activeLeaf!.view as MarkdownView;
  }
}
