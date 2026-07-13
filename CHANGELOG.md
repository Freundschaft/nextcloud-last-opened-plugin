# Changelog

## 0.1.4 - 2026-07-13

- Open dashboard entries through Nextcloud's canonical file route so supported files open directly in the Viewer.

## 0.1.3 - 2026-07-13

- Allow non-admin users to record and load their own recently opened files.

## 0.1.2 - 2026-07-13

- Fix the Files-page guard for Nextcloud 33's `#content-vue` application shell.

## 0.1.1 - 2026-07-13

- Fix file-open tracking in the Nextcloud 33 Files interface.
- Resolve modern Files entries by file ID so non-folder views are tracked correctly.
- Keep tracking support for legacy Files table markup.
- Preserve tracking requests when opening a file navigates away from the page.

## 0.1.0 - 2026-07-09

- Initial release.
- Add dashboard widget for last opened files.
- Track file opens from the web Files app.
- Store at most 100 file entries per user.
