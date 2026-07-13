# Publishing

## Local release artifacts

The app id is `last_opened`. The App Store release archive must contain exactly
one top-level folder named `last_opened`.

Generated certificate files:

- Private key: `~/.nextcloud/certificates/last_opened.key`
- Certificate signing request: `~/.nextcloud/certificates/last_opened.csr`
- Nextcloud-signed certificate: `~/.nextcloud/certificates/last_opened.crt`

Keep the private key secret. Do not commit it.

## Publish version 0.1.4

1. Commit and push the release metadata.
2. Tag the release as `v0.1.4` and create a GitHub release.
3. Attach `dist/last_opened-0.1.4.tar.gz` to the GitHub release. Do not use
   GitHub's automatically generated source archives because their top-level
   folder does not match the app id.
4. Register `last_opened` at <https://apps.nextcloud.com/developer/apps/new>
   using:
   - Certificate: contents of
     `~/.nextcloud/certificates/last_opened.crt`
   - Signature: contents of `dist/last_opened-appid.sig`
5. Add the release at <https://apps.nextcloud.com/developer/apps/releases/new>
   using:
   - Download: the HTTPS URL of the attached
     `last_opened-0.1.4.tar.gz` GitHub release asset
   - Signature: contents of `dist/last_opened-0.1.4.tar.gz.sig`
   - Nightly: disabled

The release archive and its signature must always be regenerated together after
changing a file included in the archive.

## Certificate approval

The certificate was approved in the Nextcloud certificate repository:

<https://github.com/nextcloud/app-certificate-requests/commit/25dfeb4d7062deaf6461aeb32aa0aad673b13b18>
