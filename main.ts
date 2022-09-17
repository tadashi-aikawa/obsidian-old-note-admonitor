import { App, EventRef, Plugin, PluginSettingTab } from "obsidian";
import dayjs from "dayjs";
import { AppHelper } from "./app-helper";

interface Settings {}

const DEFAULT_SETTINGS: Settings = {};

export default class OldNoteAdmonitorPlugin extends Plugin {
  appHelper: AppHelper;
  settings: Settings;
  fileOpenHandler: EventRef;

  async onload() {
    this.appHelper = new AppHelper(this.app);
    await this.loadSettings();
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.fileOpenHandler = this.app.workspace.on("file-open", async (file) => {
      const markdownView = this.appHelper.getMarkdownViewInActiveLeaf()!;
      if (!markdownView || !file) {
        return;
      }

      const cls = "old-note-admonitor__old-note-container";
      markdownView.containerEl.find(`.${cls}`)?.remove();

      const content = await app.vault.cachedRead(file);
      const pattern = new RegExp(
        `<div class="minerva-updated-meta">(?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})</div>`,
        "g"
      );
      const lastUpdated = Array.from(content.matchAll(pattern)).first()?.groups
        ?.date;
      if (!lastUpdated) {
        return;
      }

      const pastDays = dayjs().diff(dayjs(lastUpdated), "day");
      if (pastDays > 180) {
        markdownView.containerEl.createDiv({
          text: `The content has been no updated for over ${pastDays} days`,
          cls,
        });
      }
    });
  }

  onunload() {
    this.app.workspace.offref(this.fileOpenHandler);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: OldNoteAdmonitorPlugin;

  constructor(app: App, plugin: OldNoteAdmonitorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Main" });
  }
}
