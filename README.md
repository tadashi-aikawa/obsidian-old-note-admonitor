# Old Note Admonitor

[![release](https://img.shields.io/github/release/tadashi-aikawa/obsidian-old-note-admonitor.svg)](https://github.com/tadashi-aikawa/obsidian-old-note-admonitor/releases/latest)
[![CI](https://github.com/tadashi-aikawa/obsidian-old-note-admonitor/workflows/CI/badge.svg)](https://github.com/tadashi-aikawa/obsidian-old-note-admonitor/actions)
![downloads](https://img.shields.io/github/downloads/tadashi-aikawa/obsidian-old-note-admonitor/total)

This Obsidian plugin shows admonitions if the note has not been updated for over specific days.

![image](https://raw.githubusercontent.com/tadashi-aikawa/obsidian-old-note-admonitor/master/resources/image.png)

## 👥 For users

### ⏬ Install

You can download via `Community plugins` > `Browse`.

![image](https://raw.githubusercontent.com/tadashi-aikawa/obsidian-old-note-admonitor/master/resources/install.png)

### ⚙ Settings

#### Message template

If today is 2022-09-11 and the date on the note is 2022-09-01,

- It shows `10 days passed!` if you set `${numberOfDays} days passed!`
- It shows `10 days passed since 2022-09-01` if you set `${numberOfDays} days passed since ${date}`

Default: `The following content hasn't been updated in the last ${numberOfDays} days`

#### Date to be referred

The setting is to decide what to reference the date from.

- Modified time
- Front matter
- Capture group

`Default: Modified time`

##### Modified time

File last modified date ( = TFile.stat.mtime).

##### Front matter

![front matter](https://raw.githubusercontent.com/tadashi-aikawa/obsidian-old-note-admonitor/master/resources/front-matter.png)

The `Front matter key` option can specify any key name.

`Default: updated`

##### Capture group

If you set `^// updated: (?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})` to `Capture group pattern`, the date is extracted as follows.

![capture-group](https://raw.githubusercontent.com/tadashi-aikawa/obsidian-old-note-admonitor/master/resources/capture-group.png)

`Default: ^// (?<date>[0-9]{4}/[0-9]{2}/[0-9]{2})`

#### Min number of days to show a warning

If today is 2022-09-11 and the date on the note is 2022-09-01.

- It shows warnings if you set 10 or over
- It doesn't show warnings if you set it under 10

`Default: 180`

#### Trigger to update

- `On open file`: Update a warning after switching an active file
- `On open or save file`: Update a warning after switching an active file or (auto) saving a file

#### Exclude prefix path patterns

If set, It doesn't show a warning in the file whose path starts with one of the patterns. It can set multi patterns by line breaks.

For example, You want to ignore the following files.

- `Daily Report/10/2022-10-01.md`
- `Daily Report/10/2022-10-02.md`
- `Daily Report/11/2022-11-05.md`
- `Daily Report/11/2022-11-06.md`

You have to set

```
Daily Report/
```

or

```
Daily Report/10/
Daily Report/11/
```

### 🎨 Styles

You can customize the style of admonitions by editing the following classes.

- `.old-note-admonitor__old-note-container`
- `.old-note-admonitor__old-note-container:before`
- `.old-note-admonitor__old-note-container__warning`
- `.old-note-admonitor__old-note-container__warning:before`
- `.old-note-admonitor__old-note-container__error`
- `.old-note-admonitor__old-note-container__error:before`

For details, please show `style.css`.

## 🖥️ For developers

- Requirements
  - [Task]

### Development

```console
task init
task dev
```

### Release

```console
task release VERSION=1.2.3
```

[Task]: https://github.com/go-task/task
