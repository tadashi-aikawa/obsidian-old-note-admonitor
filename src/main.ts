import { EventRef, MarkdownView, Plugin, TFile } from "obsidian";
import dayjs from "dayjs";
import { AppHelper } from "./app-helper";
import { DEFAULT_SETTINGS, OldNoteAdmonitorTab, Settings } from "./settings";
import { ExhaustiveError } from "./errors";

const ADMONITOR_CLS = "old-note-admonitor__old-note-container";

// noinspection JSUnusedGlobalSymbols
export default class OldNoteAdmonitorPlugin extends Plugin {
  appHelper: AppHelper;
  settings: Settings;
  fileOpenHandler: EventRef;
  fileSaveHandler: EventRef;

  async onload() {
    this.appHelper = new AppHelper(this.app);
    await this.loadSettings();
    this.addSettingTab(new OldNoteAdmonitorTab(this.app, this));

    await this.exec(this.appHelper.getActiveFile());
    this.addListeners();
  }

  onunload() {
    this.removeListeners();
  }

  addListeners() {
    this.fileOpenHandler = this.app.workspace.on("file-open", (file) =>
      this.exec(file)
    );
    if (this.settings.triggerToUpdate === "On open or save file") {
      this.fileSaveHandler = this.app.vault.on("modify", (file) => {
        this.exec(file as TFile);
      });
    }
  }

  removeListeners() {
    this.app.workspace.offref(this.fileOpenHandler);
    this.app.vault.offref(this.fileSaveHandler);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.removeListeners();
    this.addListeners();
    await this.exec(this.appHelper.getActiveFile());
  }

  async exec(file: TFile | null) {
    const markdownView = this.appHelper.getMarkdownViewInActiveLeaf();
    if (!markdownView || !file) {
      return;
    }

    this.removeAdmonitor(markdownView);
    if (
      this.settings.excludePrefixPathPatterns.some((p) =>
        file.path.startsWith(p)
      )
    ) {
      return;
    }

    const lastUpdated = await this.findDate(file);
    if (!lastUpdated) {
      if (this.settings.showWarningIfDataIsNotFound) {
        this.insertAdmonitor(markdownView, "The date was not found");
      }
      return;
    }

    const numberOfDays = dayjs().diff(lastUpdated, "day");
    if (numberOfDays > this.settings.minNumberOfDaysToShowWarning) {
      const text = this.settings.messageTemplate
        .replace("${numberOfDays}", String(numberOfDays))
        .replace("${date}", lastUpdated.format("YYYY-MM-DD"));
      this.insertAdmonitor(markdownView, text);
    }
  }

  removeAdmonitor(markdownView: MarkdownView) {
    markdownView.containerEl.find(`.${ADMONITOR_CLS}`)?.remove();
  }

  insertAdmonitor(markdownView: MarkdownView, text: string) {
    const el = createDiv({
      text,
      cls: ADMONITOR_CLS,
    });
    markdownView.containerEl
      .find(".view-header")
      .insertAdjacentElement("beforebegin", el);
  }

  async findDate(file: TFile): Promise<dayjs.Dayjs | undefined> {
    switch (this.settings.dateToBeReferred) {
      case "Modified time":
        return dayjs(file.stat.mtime);
      case "Front matter":
        const df =
          app.metadataCache.getFileCache(file)?.frontmatter?.[
            this.settings.frontMatterKey
          ];
        return df ? dayjs(df) : undefined;
      case "Capture group":
        const content = await app.vault.cachedRead(file);
        const pattern = new RegExp(this.settings.captureGroupPattern, "g");
        const dc = content
          .split("\n")
          .map(
            (line) => Array.from(line.matchAll(pattern)).first()?.groups?.date
          )
          .filter((x) => x)
          .first();
        return dc ? dayjs(dc) : undefined;
      default:
        throw new ExhaustiveError(this.settings.dateToBeReferred);
    }
  }
}
