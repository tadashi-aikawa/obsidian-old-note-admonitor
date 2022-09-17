import { App, PluginSettingTab, Setting } from "obsidian";
import OldNoteAdmonitorPlugin from "./main";

export interface Settings {
  minNumberOfDaysToShowWarning: number;
}

export const DEFAULT_SETTINGS: Settings = {
  minNumberOfDaysToShowWarning: 180,
};

export class OldNoteAdmonitorTab extends PluginSettingTab {
  plugin: OldNoteAdmonitorPlugin;

  constructor(app: App, plugin: OldNoteAdmonitorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Main" });

    new Setting(containerEl)
      .setName("Min number of days to show a warning")
      .addText((tc) => {
        tc.inputEl.type = "number";
        return tc
          .setValue(String(this.plugin.settings.minNumberOfDaysToShowWarning))
          .onChange(async (value) => {
            this.plugin.settings.minNumberOfDaysToShowWarning = Number(value);
            await this.plugin.saveSettings();
          });
      });
  }
}
