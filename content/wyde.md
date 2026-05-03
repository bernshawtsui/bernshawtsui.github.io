---
title: "wyde"
url: "/wyde"
description: "A native macOS markdown viewer that finally treats wide tables right — resizable columns and inline cell editing without ever rewriting your .md with whitespace padding."
hideMeta: true
ShowBreadCrumbs: false
ShowReadingTime: false
ShowPostNavLinks: false
disableShare: true
---

<p align="center">
  <img src="/images/wyde/wyde-logo-with-name.png" alt="wyde" width="220">
</p>

<p align="center">
  <em>A native macOS markdown viewer for wide tables.</em>
</p>

<p align="center">
  <img src="/images/wyde/demo-1.gif" alt="Demo: dragging the column dividers of a rendered markdown table inside wyde to make a wide table readable" width="780" style="max-width: 100%; height: auto;">
</p>

<p align="center">
  <a href="https://github.com/bernshawtsui/wyde" target="_blank" rel="noopener"><strong>View on GitHub →</strong></a>
</p>

Real `<table>` elements with draggable column dividers and inline cell editing. Edits write back surgically — only the changed cell touches disk; the rest of the file stays byte-identical so `git diff` and external tools see no churn.

## Why I built this

In my current job, we're all-in on AI, and we've been working a lot with Andrej Karpathy's idea of an LLM-managed knowledge base. As a result, we have a lot of AI-generated files in markdown — schema definitions, ETL mappings, comparison matrices, decision logs — and the moment a table gets more than four or five columns, every markdown editor I've tried becomes painful to use. Obsidian, Typora, VS Code, Mark Text — they all treat tables like punishment.

The fundamental problem is that markdown's plain-text format has **no concept of column width**. Editors deal with this in one of two unhappy ways:

- *Ignore it.* The table renders with all columns squashed together; long content wraps awkwardly or gets cut off; you can't read what's in front of you.
- *Pad the source with whitespace* to "fix" rendering. This produces noisy diffs, fights every other tool that touches the same file (Claude Code in particular keeps re-padding tables out from under you), and makes `git blame` useless.

wyde takes a third path: **column width is purely a session-only display concern.** Drag a column wider, read your table comfortably, close the file. The `.md` on disk never gets touched. Next time you open it, columns reset to a sensible default — and the file stays pure markdown that every other tool can read without surprise.

You also get **inline editing for cells, paragraphs, ATX headings, and list items**. Click a cell or double-click a paragraph, type, blur to save. The diff on disk shows only the edited block; everything else stays byte-identical.

## Highlights

- **Drag-resizable columns** that never alter the source file.
- **Surgical writes** — edits touch only the changed cell or block; `git diff` stays clean.
- **Inline editing** for table cells, paragraphs, ATX headings, and list items.
- **External-edit aware** — file watcher refreshes the view automatically (deferred while you're editing).
- **Obsidian-style multi-vault** — ⌘N opens a new window for a different folder.

## Get it

The source lives on GitHub. wyde is a native macOS app and currently distributed source-only — clone the repo and build it yourself with the Mac toolchain. Setup is documented in [DEVELOPING.md](https://github.com/bernshawtsui/wyde/blob/main/DEVELOPING.md).

<p align="center" style="margin-top: 1.5em;">
  <a href="https://github.com/bernshawtsui/wyde" target="_blank" rel="noopener"><strong>bernshawtsui/wyde</strong></a>
</p>
