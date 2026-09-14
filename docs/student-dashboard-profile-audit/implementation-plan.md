# Student dashboard and profile: Material 3 audit and implementation plan

## Scope reviewed

This plan is based on a complete local review of the Material 3 reference captured in:

- `m3-downloader/m3-offline/foundations` — 86 HTML pages
- `m3-downloader/m3-offline/styles` — 35 HTML pages
- `m3-downloader/m3-offline/components` — 138 HTML pages
- `frontend/src/shared/components` — the current shared React component library
- the current Student shell, dashboard, profile, supporting editors, tests, API hooks, schemas, and responsive CSS

The current dashboard and profile are functional. This work is a design-system refactor and UX upgrade over the existing API contracts; it should not replace the working data model, authorization boundaries, optimistic-concurrency handling, or query invalidation.

## Foundation audit and resulting decisions

| Foundation area | Decision for these pages |
| --- | --- |
| Foundations overview | Treat accessibility, content, layout, interaction, and tokens as one system. Preserve native HTML semantics and the existing Student workspace hierarchy. |
| Accessibility: overview | Target WCAG-aligned behavior: text contrast at least 4.5:1, large text and meaningful graphics at least 3:1, visible focus, semantic landmarks/headings, and no information conveyed by color alone. |
| Accessibility: designing | Keep DOM order equal to visual/read order; support keyboard, screen reader, mouse, touch, zoom, and 200% text resizing. Use native controls wherever possible. Every icon-only action needs an accessible name and visible tooltip. |
| Accessibility: writing and text | Use concise labels, persistent field names, useful error text, and contextual image alternatives. The profile photo alt text identifies the student; decorative dashboard icons remain hidden from assistive technology. |
| Building for all | Use plain language suitable for varied literacy and technical experience. Avoid assumptions about gender, culture, ability, location, input device, connection speed, or whether profile sections contain data. Test with keyboard-only use, screen readers, high zoom, reduced motion, dark mode, and slow/error responses. |
| Content design | Put the task or result first, use sentence case, and explain action consequences. Empty states should say what is missing and give the next action. Destructive dialogs should name the item and state what removal changes. |
| Alt text | Use meaningful alt text only for informative images. Use `alt=""`/`aria-hidden` for decorative symbols. When the student photo is absent, expose the initials fallback as an image with a useful label. |
| Global writing | Avoid idioms, slash-heavy labels, unexplained abbreviations, and fixed English date strings. Use `Intl` for displayed dates/times, allow long translated labels to wrap, and use logical leading/trailing layout properties for RTL. |
| Notifications | Confirm saves/uploads/removals with concise, user-focused feedback. Errors stay inline near their source. Notifications with actions must remain until acted upon; transient messages must also have durable inline/state feedback where needed. |
| Style guide | Use sentence case for headings, fields, buttons, dialog titles, and navigation. Prefer specific verbs: “Save profile”, “Add education”, “Remove picture”. Avoid unnecessary punctuation in short labels. |
| Customizing Material | Keep the existing Scholar Violet / Ledger Amber / Verified Teal identity, mapped through semantic Material roles. Support light and dark themes. Do not place brand hex values directly in feature CSS. |
| Watches | A watch UI is outside this desktop-first scope. Its transferable principles still apply: prioritize the most important information, keep targets large, and avoid dense controls at compact widths. |
| XR design and components | XR is outside this web scope. Its transferable principles are comfortable motion, clear depth, grouped surfaces, predictable interactions, and multimodal feedback. Do not add XR-specific depth or gestures. |
| Design tokens | Use reference/system/component tokens rather than hardcoded color, radius, elevation, duration, target-size, typography, or spacing values. Extend the token set only when a required semantic role is missing. |
| Gestures and inputs | Every action must work with keyboard and pointer; touch is an enhancement. Do not require hover, swipe, drag, long-press, or gesture-only discovery. Preserve browser text selection and expected mouse/keyboard behavior. |
| Selection | Use checkboxes for independent “include in CV/current” choices and a selected state plus icon/text when applicable. Never indicate selection through color alone. |
| States | Provide enabled, hover, focus, pressed, selected, disabled, loading, error, and empty states consistently. Use state-layer tokens. Disable duplicate submission while preserving a readable reason/status. |
| Layout overview and scaffold | Retain the existing app scaffold: navigation perimeter, top bar, and one main content pane. Dashboard follows a feed/grid composition; Profile uses a supporting-pane composition on wide screens and one pane on narrow screens. |
| Grids, spacing, and density | Use the 8dp spacing system and existing spacing tokens. Keep comfortable density for profile editing; use compact density only for repetitive saved-entry rows when it remains scannable. |
| Breakpoints | Follow all five Material ranges: compact `<600`, medium `600–839`, expanded `840–1199`, large `1200–1599`, and extra-large `>=1600`. Content changes by revealing, repositioning, resizing, or stacking—not by shrinking controls below usable sizes. |
| Bidirectionality and RTL | Use logical properties (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start`), mirror directional navigation icons, and keep non-directional icons unchanged. Do not derive content order from left/right assumptions. |
| Canonical examples | Dashboard uses the feed pattern for summary cards. Profile uses a supporting pane for identity and a primary editing pane. On compact/medium screens these become a single logical flow. |
| Usability | Emphasize one main action per area, keep related controls together, expose recovery next to errors, preserve entered data, and avoid overwhelming the page. Progressive disclosure through profile sections is appropriate, provided collapsed state remains clear and keyboard-safe. |
| Material A–Z | Use Material terms consistently in implementation and review: app bar, navigation rail/bar, card, dialog, snackbar, state layer, supporting pane, breakpoint, and token. |

## Styles audit and resulting decisions

| Style area | Decision for these pages |
| --- | --- |
| Styles overview | Apply the shared theme consistently rather than feature-specific visual rules. |
| Color system and roles | Map containers/content to `surface`, `surface-container*`, `on-surface`, `primary`, `secondary`, `tertiary`, `outline`, and `error` roles. Verify light and dark combinations, including focus rings and disabled/loading states. |
| Static, dynamic, advanced schemes and resources | Use the existing static branded light/dark schemes as the reliable baseline. Keep the token architecture compatible with future dynamic color; dynamic wallpaper/content color is not required for this web release. Use custom roles only for durable semantics, not one-off decoration. |
| Elevation | Use surface tone for most hierarchy. Use low elevation for cards and higher elevation only for modal overlays/temporary surfaces. Avoid decorative shadow inflation. |
| Icons | Use the existing Material Symbols wrapper consistently. Icons supplement visible labels; standalone icons require accessible names and tooltips. Keep weight, fill, grade, and optical size consistent by token/variant. |
| Motion physics | Use spatial motion for position/size and effect motion for color/opacity. Keep motion subtle, interruptible, and tokenized. Disable nonessential transform/transition effects under `prefers-reduced-motion`. |
| Easing, duration, transitions | Use the existing motion tokens until true web spring tokens are introduced. Page transitions should preserve orientation and dialogs should enter/exit predictably without delaying task completion. |
| Shape | Use the established shape scale: restrained corners for fields/list rows, larger corners for cards, and extra-large/fullscreen treatment for dialogs according to width. Shape must reinforce containment, not compete with content. |
| Spacing | Use multiples from the 8dp scale for page gutters, pane gaps, card padding, form rows, and action groups. Adapt gutters and gaps by breakpoint. |
| Typography | Use semantic type tokens for page title, section title, body, label, supporting text, and numeric metrics. Allow wrapping, 200% text resize, and long localized strings without clipping. Avoid uppercase UI copy; reserve tabular numerals for metrics where useful. |

## Components required

The implementation should reuse and, where needed, extend the shared components below.

| Page area | Shared components to use | Feature composition |
| --- | --- | --- |
| Student scaffold | `TopAppBar`, `NavigationRail`, `NavigationBar`, `NavigationDrawer` only for the compact modal menu, `ThemeToggle`, `Icon`, `IconButton`, `Tooltip`, `LogoutConfirmDialog` | Keep Student navigation data and route behavior in `StudentLayout`/`StudentSidebar`. Prefer the shared expanded rail on large/extra-large widths, matching current workspace conventions. |
| Page structure | `PageHeader`, `SectionCard`, `Card`, `Divider` | Dashboard summary/metric grid; Profile identity supporting pane and main editing pane. |
| Dashboard | Extend shared `MetricCard` to accept icon, description, and semantic surface; use `Icon` and `Card`/`SectionCard` | Replace the one-off `StudentMetricCard` presentation with the extended shared component while preserving its data contract. Dashboard has no page-specific pop-up in the current requirements. |
| Core profile form | `FormField`, `TextField`/`TextInput`, new shared `TextArea` (or a deliberate multiline extension), `Button`, `LoadingButton` behavior | Editable full name, personal email, headline, phone, location, and summary. Official identity values stay read-only in a semantic `dl`. |
| Profile picture | `FileUploadField`, `Button`, `Icon`, `ConfirmDialog`, notification feedback | Preview, upload, cancel preview, and remove. Preserve file-policy validation and meaningful image/fallback labels. |
| Profile collections | `SearchInput`, `Button`, `IconButton`, `Tooltip`, `Card`, `List`, `Divider`, `Checkbox`, `PaginationBar` | Professional links, education, certificates, awards, activities, and experience. Retain independent loading/error/empty/search/pagination state per collection. |
| Feedback | `LoadingBoundary` where practical, `SkeletonBlock`/existing page skeletons, `ErrorState`, `EmptyState`, `Snackbar` or the existing notification viewport after alignment | Page load, background refresh, mutation progress, inline validation, conflicts, success, and recoverable errors. |
| Editors and confirmations | Consolidate on `Dialog` plus `ConfirmDialog`; use responsive `small/medium/large/fullscreen` sizing | Add/edit entry dialogs, remove-entry confirmations, remove certificate evidence, remove profile picture, discard unsaved editor changes, and logout confirmation. |

### Pop-up inventory

| Pop-up | Desktop / expanded behavior | Compact / medium behavior |
| --- | --- | --- |
| Add/edit professional link | Medium dialog | Fullscreen dialog if content or translated labels do not fit; otherwise edge-safe medium dialog |
| Add/edit education | Large dialog | Fullscreen dialog |
| Add/edit certificate and evidence | Large dialog | Fullscreen dialog |
| Add/edit award or achievement | Large dialog | Fullscreen dialog |
| Add/edit extracurricular activity | Large dialog | Fullscreen dialog |
| Add/edit professional experience | Large dialog | Fullscreen dialog |
| Delete a saved entry | Small confirmation dialog naming the entry and consequence | Small edge-safe confirmation dialog |
| Remove certificate evidence | Small confirmation dialog | Small edge-safe confirmation dialog |
| Remove profile picture | Small confirmation dialog | Small edge-safe confirmation dialog |
| Discard unsaved changes | Small confirmation dialog, opened only when closing/navigating with edits | Small edge-safe confirmation dialog |
| Log out | Existing shared confirmation dialog | Existing shared confirmation dialog |

Dismissive actions appear before confirming actions. Confirming actions are disabled during submission. Focus is trapped inside the active dialog, returns to the invoking control, Escape works when safe, background content is inert, and long forms scroll inside the dialog without hiding the title/actions.

## Shared-component issues to resolve first

1. Consolidate `Modal` and `Dialog` usage. `Modal` currently makes the app root inert, traps/restores focus, and locks scrolling; `Dialog` does not isolate the background in the same way. Move these guarantees into one shared dialog foundation and keep `ConfirmDialog` as a composition of it.
2. Fix `TextField` IDs and error semantics. It currently creates an ID with `Math.random()` during render and does not connect error/supporting text through stable `aria-describedby` IDs. Use `useId`, preserve caller IDs, and expose stable supporting/error associations.
3. Add a shared multiline text-field component or supported multiline variant. Profile forms currently style raw `textarea` elements separately.
4. Replace raw profile checkboxes with the shared `Checkbox`, and raw collapse/close/edit/delete icon buttons with `IconButton` plus accessible labels/tooltips.
5. Extend shared `MetricCard` so Dashboard can reuse it; retire the duplicate feature presentation after migration.
6. Align notification rendering with the shared `Snackbar` contract and accessibility guidance. Mutation errors remain inline; success feedback is announced politely.
7. Make dialog size responsive. Long profile editors become fullscreen below 600px, remain scroll-safe at 200% zoom, and keep actions visible without overlaying fields.
8. Audit CSS for physical left/right properties and replace them with logical properties where direction matters.

## Implementation plan

### Phase 1 — Lock behavior and acceptance criteria

- Preserve existing endpoints, schemas, field ownership, optimistic concurrency (`If-Match`), pagination, search, upload policy, and query invalidation.
- Record the current desktop, tablet, mobile, dark-mode, loading, empty, and error states as visual baselines.
- Define acceptance checks for all five breakpoints, keyboard flow, screen-reader names, 200% text zoom/reflow, reduced motion, and light/dark contrast.

### Phase 2 — Harden the shared Material components

- Unify the dialog foundation and add responsive sizing plus unsaved-change handling hooks.
- Fix `TextField`, add shared multiline input, standardize checkbox/icon-button/tooltip use, and align snackbar semantics.
- Extend `MetricCard` for the dashboard use case.
- Add focused component tests for keyboard/focus restoration, accessible field errors, responsive dialog mode, and reduced motion. These tests cover behavior that feature tests cannot safely duplicate.

### Phase 3 — Implement the Student dashboard composition

- Compose the page from `PageHeader`, `SectionCard`, shared `MetricCard`, and `Icon`.
- Keep the welcome/supporting copy brief and remove implementation-facing text such as “loaded from the API contract”.
- Use a four-column metric grid at extra-large widths, two columns at expanded/large widths when space allows, and one column at compact widths; avoid excessive line length with a centered maximum content width.
- Preserve loading, error/retry, null GPA, localized number/date formatting, and dark/reduced-motion states.

### Phase 4 — Implement the Student profile structure

- Use a supporting-pane layout at large/extra-large widths: a stable identity card and a flexible main editor pane.
- At medium/expanded widths, stack the identity summary above the editor or use a narrower supporting pane only when the main form retains usable field widths. At compact widths, use one pane and one-column forms.
- Keep verified university/academic values visibly read-only and separate from student-owned fields.
- Compose editable fields from shared form controls, keep persistent labels/help/errors, focus the first invalid field, preserve dirty values during conflicts, and add a discard confirmation for navigation/close with unsaved edits.

### Phase 5 — Implement collection sections and pop-ups

- Retain the six collection sections with consistent headings, descriptions, add actions, search, saved-entry cards/lists, empty/error/loading states, and pagination.
- Migrate every editor to the shared responsive dialog and shared form controls.
- Make delete actions specific (`Remove “AWS Cloud Practitioner”?`) and state whether evidence/entry data is permanently removed.
- Keep file type/size guidance next to upload controls and announce rejected files inline without clearing unrelated form data.
- Preserve the trigger element for focus restoration after add/edit/delete dialogs close.

### Phase 6 — Responsive, RTL, content, and visual refinement

- Apply the five Material breakpoint ranges to navigation, page gutters, metric columns, profile panes, form columns, dialog mode, and action stacking.
- Replace physical directional CSS where needed, verify `dir="rtl"`, and test long labels/data values.
- Normalize sentence case throughout Student Dashboard/Profile and remove slash-heavy or implementation-facing labels.
- Verify semantic color roles, elevation, type scale, spacing, state layers, icon style, touch targets of at least 48px, and reduced-motion behavior.

### Phase 7 — Verification and release gate

- Unit/component tests: shared fields, checkbox semantics, dialog focus/inert/restore, confirmation ordering, notifications, and metric card variants.
- Feature tests: dashboard data/null/error/retry; profile ownership, dirty/save/conflict/reload; all six add/edit/delete flows; image/evidence validation; search/pagination/empty states.
- End-to-end checks: keyboard-only desktop and mobile navigation, dialog lifecycle, focus return, 200% zoom, RTL smoke test, reduced motion, dark mode, and widths near 599/600, 839/840, 1199/1200, and 1599/1600.
- Visual regression: dashboard and profile in content/loading/error/empty states at compact, medium, expanded, large, and extra-large widths.
- Run type checking, linting, relevant Vitest suites, Student Playwright specs, and the existing visual/motion suites before merging.

## Definition of done

- Both pages use shared Material components for all common UI primitives.
- No duplicate Dashboard metric-card presentation or raw profile checkboxes/icon-only buttons remain.
- All profile pop-ups share one accessible dialog behavior and adapt safely to compact screens.
- The pages work with keyboard, screen reader semantics, touch, mouse, 200% text resize, reduced motion, light/dark themes, and RTL layout.
- Every loading, empty, error, success, conflict, disabled, and destructive state is understandable without relying on color or transient feedback.
- Existing API contracts, field ownership, permissions, concurrency protection, and saved data behavior remain intact.
