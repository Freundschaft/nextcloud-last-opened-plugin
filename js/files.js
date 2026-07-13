(function() {
    'use strict';

    if (!window.OC || !OC.generateUrl) {
        return;
    }

    const content = document.getElementById('content');
    if (!content || !content.classList.contains('app-files')) {
        return;
    }

    let lastRecordedReference = null;
    let lastRecordedAt = 0;

    const getFileReference = (element) => {
        const modernRow = element.closest('[data-cy-files-list-row]');
        const modernFileId = Number(modernRow?.getAttribute('data-cy-files-list-row-fileid'));
        if (Number.isInteger(modernFileId) && modernFileId > 0) {
            return { fileId: modernFileId };
        }

        const row = element.closest('tr[data-file], [data-file][data-path], [data-path][data-file]');
        if (row && row.dataset.file) {
            const dir = row.dataset.path || '';
            return { path: `${dir}/${row.dataset.file}`.replace(/\/+/g, '/') };
        }

        const href = element.getAttribute('href');
        if (!href) {
            return null;
        }

        try {
            const url = new URL(href, window.location.origin);
            const dir = url.searchParams.get('dir') || '';
            const scrollTo = url.searchParams.get('scrollto') || '';
            if (scrollTo !== '') {
                return { path: `${dir}/${scrollTo}`.replace(/\/+/g, '/') };
            }
        } catch (error) {
            return null;
        }

        return null;
    };

    const recordFile = (reference) => {
        if (!reference) {
            return;
        }

        const now = Date.now();
        const referenceKey = reference.fileId ? `id:${reference.fileId}` : `path:${reference.path}`;
        if (referenceKey === lastRecordedReference && now - lastRecordedAt < 1500) {
            return;
        }
        lastRecordedReference = referenceKey;
        lastRecordedAt = now;

        fetch(OC.generateUrl('/apps/last_opened/opened'), {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json',
                requesttoken: OC.requestToken,
            },
            body: JSON.stringify(reference),
        }).catch(() => {
            // Losing one client-side tracking event should not interrupt file browsing.
        });
    };

    const maybeRecord = (event) => {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return;
        }

        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
            return;
        }

        const link = target.closest([
            '[data-cy-files-list-row-name-link]',
            '.files-list__row-name-link',
            '.files-list__row-icon',
            'a.name',
            'a[href*="scrollto"]',
            'tr[data-file] a',
            '[data-file]',
        ].join(', '));
        if (!link) {
            return;
        }

        recordFile(getFileReference(link));
    };

    document.addEventListener('click', maybeRecord, true);
    document.addEventListener('dblclick', maybeRecord, true);
    document.addEventListener('keydown', maybeRecord, true);
})();
