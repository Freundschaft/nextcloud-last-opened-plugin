# Publishing

## Local release artifacts

The app id is `last_opened`. The App Store release archive must contain exactly
one top-level folder named `last_opened`.

Generated certificate files:

- Private key: `~/.nextcloud/certificates/last_opened.key`
- Certificate signing request: `~/.nextcloud/certificates/last_opened.csr`

Keep the private key secret. Do not commit it.

## Next steps

1. Submit the CSR to the Nextcloud certificate repository.
2. Save the returned signed certificate as `~/.nextcloud/certificates/last_opened.crt`.
3. Register `last_opened` on apps.nextcloud.com with the certificate and app id signature.
4. Upload the release archive URL and release archive signature.

The app metadata still needs real public URLs for:

- `bugs`
- `repository`

Add those to `appinfo/info.xml` before the App Store submission.
