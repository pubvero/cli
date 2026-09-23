---
name: Pubvero — Local Preview
description: "The operational preview subset of Pubvero's Mesa de Emissão identity."
colors:
  paper-surface: 'oklch(.992 .006 88)'
  carbon-ink: 'oklch(.205 .012 92)'
  registry-muted: 'oklch(.47 .018 82)'
  hairline: 'oklch(.83 .018 84)'
  action-green: 'oklch(.385 .095 153)'
  action-on-green: 'oklch(.985 .008 92)'
  dark-surface: 'oklch(.205 .012 90)'
  dark-paper-ink: 'oklch(.935 .012 88)'
  dark-muted: 'oklch(.72 .018 88)'
  dark-hairline: 'oklch(.34 .018 88)'
  dark-action-green: 'oklch(.71 .125 153)'
  dark-action-on-green: 'oklch(.16 .02 153)'
typography:
  title:
    fontFamily: "'Avenir Next', Avenir, 'Segoe UI', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Avenir Next', Avenir, 'Segoe UI', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  metadata:
    fontFamily: "'Avenir Next', Avenir, 'Segoe UI', system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Avenir Next', Avenir, 'Segoe UI', system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.5
rounded:
  control: '9px'
spacing:
  micro: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '20px'
  xl: '24px'
  2xl: '32px'
components:
  reload:
    backgroundColor: '{colors.action-green}'
    textColor: '{colors.action-on-green}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  reload-dark:
    backgroundColor: '{colors.dark-action-green}'
    textColor: '{colors.dark-action-on-green}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  preview-bar:
    backgroundColor: '{colors.paper-surface}'
    textColor: '{colors.carbon-ink}'
    padding: '12px 24px'
---

# Design System: Pubvero — Local Preview

## Overview

**Creative North Star: "Mesa de Emissão"**

This compact authoring surface inherits Pubvero's warm paper, carbon ink and forest action green. The authored Page has visual priority; a quiet operational frame establishes its connection and version. This record describes the implemented preview in `src/preview-view.js`, not the full hosted product's component library.

**Key Characteristics:**

- The Page occupies the available viewport below a compact bar.
- Fine rules and restrained operational text keep the frame quiet.
- Light and dark chrome preserve the same semantic color roles.

## Colors

### Primary

Action Forest and its paired foreground identify the reload action, visible keyboard focus and text selection. Connection status is readable text, without an additional status color.

### Neutral

Paper Surface carries the bar and recovery area; Carbon Ink carries primary text. Registry Muted supports instance and version metadata. Hairline separates the bar from the Page. Their dark counterparts switch together with the system color preference. The iframe has a white base; authored Page styles control its own appearance.

**The Whole-Theme Rule.** Switch every chrome color role together; the Page's theme remains independent.

## Typography

Use the Avenir-led operational stack in the frontmatter. The Page title uses the title role; instance and status use metadata with tabular numerals; reload uses the label role. The live Pubvero name is semibold body text. There is no display typography or shipped logo asset in this subset; the established Edition identity is not replaced.

## Layout

The shell fills the dynamic viewport (`100dvh`) as a vertical flex layout. Its wrapping header uses the preview-bar padding and a 16px gap; the iframe fills the remaining width and height without a surrounding card. Titles and metadata wrap long strings.

At widths of 600px or less, header padding becomes `12px 16px`, gaps become `8px 12px`, and the brand occupies its own row. Details retain a 160px minimum width; the reload button uses `10px 14px` padding. Recovery copy is limited to 65ch, with 32px padding on wider screens and `24px 16px` on smaller screens.

## Elevation & Depth

The preview uses no shadows, overlays or decorative motion. A one-pixel separator establishes the boundary between platform chrome and authored content.

## Shapes

The reload control has gently rounded corners using the control token. The Page viewport and header retain straight edges.

## Components

### Reload

The primary action has a minimum height of 44px. Hover applies `brightness(.92)`; keyboard focus uses a two-pixel Action Forest outline offset by three pixels. While pending, the control is disabled, its label communicates loading, opacity becomes `.65`, and the cursor indicates waiting. There are no animated transitions.

### Connection and version bar

The bar contains the live brand name, Page title, connected instance, connection/version status and reload action. Status changes are announced politely. All operational copy supports Brazilian Portuguese and English; version numbers use the selected locale. Publication remains a terminal action.

### Page and recovery area

The iframe receives an accessible localized title. Reload removes the prior Page while preparing the next snapshot. Preparation failures replace the frame with an announced recovery message and leave reload available. Authored Page content retains its own visual design.

## Do's and Don'ts

### Do:

- Do keep the Page visually dominant and the preview bar compact.
- Do preserve the complete light/dark palette pairing and visible keyboard focus.
- Do keep status and recovery copy explicit and localized.

### Don't:

- Don't add publication controls to the browser preview.
- Don't infer a new logo or marketing component system from this narrow surface.
- Don't present an old snapshot as the result of a failed reload.
