import { App, PluginSettingTab, Setting } from "obsidian";
import OldNoteAdmonitorPlugin from "./main";
import { mirror, mirrorMap } from "./collections";

const dateToBeReferredList = [
  "modified time",
  "front-matter",
  "capture-group",
] as const;
export type DateToBeReferred = typeof dateToBeReferredList[number];

export interface Settings {
  minNumberOfDaysToShowWarning: number;
  messageTemplate: string;
  dateToBeReferred: DateToBeReferred;
  frontMatterKey: string;
  captureGroupPattern: string;
}

export const DEFAULT_SETTINGS: Settings = {
  minNumberOfDaysToShowWarning: 180,
  messageTemplate:
    "The content has been no updated for over ${numberOfDays} days",
  dateToBeReferred: "modified time",
  frontMatterKey: "updated",
  captureGroupPattern: `// (?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})`,
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

    containerEl.createEl("h2", { text: "Old Note Admonitor - Settings" });

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

    new Setting(containerEl)
      .setName("Message template")
      .setDesc("${numberOfDays} and ${date} are available variables")
      .addText((tc) => {
        tc.inputEl.addClass("old-note-admonitor__settings__message_template");
        return tc
          .setValue(String(this.plugin.settings.messageTemplate))
          .onChange(async (value) => {
            this.plugin.settings.messageTemplate = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl).setName("Date to be referred").addDropdown((dc) =>
      dc
        .addOptions(mirror([...dateToBeReferredList]))
        .setValue(this.plugin.settings.dateToBeReferred)
        .onChange(async (value) => {
          this.plugin.settings.dateToBeReferred =
            value as Settings["dateToBeReferred"];
          await this.plugin.saveSettings();
          this.display();
        })
    );

    if (this.plugin.settings.dateToBeReferred === "front-matter") {
      new Setting(containerEl).setName("Front matter key").addText((tc) => {
        return tc
          .setValue(String(this.plugin.settings.frontMatterKey))
          .onChange(async (value) => {
            this.plugin.settings.frontMatterKey = value;
            await this.plugin.saveSettings();
          });
      });
    }

    if (this.plugin.settings.dateToBeReferred === "capture-group") {
      new Setting(containerEl)
        .setName("Capture group pattern")
        .setDesc(
          "Use <date> as capture name. ex: // (?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})"
        )
        .addText((tc) => {
          tc.inputEl.addClass(
            "old-note-admonitor__settings__group_capture_patterns"
          );
          return tc
            .setValue(String(this.plugin.settings.captureGroupPattern))
            .onChange(async (value) => {
              this.plugin.settings.captureGroupPattern = value;
              await this.plugin.saveSettings();
            });
        });
    }
  }
}
