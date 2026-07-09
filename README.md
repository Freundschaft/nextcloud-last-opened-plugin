# Last Opened Files

Nextcloud app that records files opened from the web Files app and shows the user's most recently opened files as a dashboard widget.

## What it tracks

- A file is recorded when the user opens it from the Files web UI.
- The dashboard shows distinct files ordered by the last time they were opened.
- The app stores at most 100 file entries per user.

It does not currently record WebDAV, desktop sync client, mobile app, or direct download activity unless that activity goes through the browser Files UI.

## Install for development

Place this directory in the Nextcloud `apps/` directory as `last_opened`, then enable it:

```bash
php occ app:enable last_opened
```

No JavaScript build step is required.
