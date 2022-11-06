import { App, PluginSettingTab, Setting } from "obsidian";
import OldNoteAdmonitorPlugin from "./main";
import { mirror } from "./collections";
import { smartLineBreakSplit } from "./utils/strings";

const dateToBeReferredList = [
  "Modified time",
  "Front matter",
  "Capture group",
] as const;
export type DateToBeReferred = typeof dateToBeReferredList[number];

const triggerToUpdateList = ["On open file", "On open or save file"] as const;
export type TriggerToUpdate = typeof triggerToUpdateList[number];

export interface Settings {
  minNumberOfDaysToShowWarning: number;
  messageTemplate: string;
  showWarningIfDataIsNotFound: boolean;
  triggerToUpdate: TriggerToUpdate;
  dateToBeReferred: DateToBeReferred;
  frontMatterKey: string;
  captureGroupPattern: string;
  excludePrefixPathPatterns: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  minNumberOfDaysToShowWarning: 180,
  messageTemplate:
    "The content has been no updated for over ${numberOfDays} days",
  showWarningIfDataIsNotFound: false,
  triggerToUpdate: "On open file",
  dateToBeReferred: "Modified time",
  frontMatterKey: "updated",
  captureGroupPattern: `^// (?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})`,
  excludePrefixPathPatterns: [],
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

    if (this.plugin.settings.dateToBeReferred === "Front matter") {
      new Setting(containerEl).setName("Front matter key").addText((tc) => {
        return tc
          .setValue(String(this.plugin.settings.frontMatterKey))
          .onChange(async (value) => {
            this.plugin.settings.frontMatterKey = value;
            await this.plugin.saveSettings();
          });
      });
    }

    if (this.plugin.settings.dateToBeReferred === "Capture group") {
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

    new Setting(containerEl).setName("Trigger to update").addDropdown((dc) => {
      dc.addOptions(mirror([...triggerToUpdateList]))
        .setValue(this.plugin.settings.triggerToUpdate)
        .onChange(async (value) => {
          this.plugin.settings.triggerToUpdate = value as TriggerToUpdate;
          await this.plugin.saveSettings();
        });
    });

    new Setting(containerEl)
      .setName("Show a warning if the date is not found")
      .addToggle((cb) =>
        cb
          .setValue(this.plugin.settings.showWarningIfDataIsNotFound)
          .onChange(async (value) => {
            this.plugin.settings.showWarningIfDataIsNotFound = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Exclude prefix path patterns")
      .setDesc(
        "If set, It doesn't show a warning in the file whose path starts with one of the patterns. It can set multi patterns by line breaks."
      )
      .addTextArea((tc) => {
        const el = tc
          .setPlaceholder("(ex: Notes/Private)")
          .setValue(this.plugin.settings.excludePrefixPathPatterns.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.excludePrefixPathPatterns =
              smartLineBreakSplit(value);
            await this.plugin.saveSettings();
          });
        el.inputEl.className =
          "old-note-admonitor____settings__exclude_path_patterns";

        return el;
      });
  }
}
