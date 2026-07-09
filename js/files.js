(function() {
    'use strict';

    if (!window.OC || !OC.generateUrl) {
        return;
    }

    const appContent = document.getElementById('app-content-files');
    if (!appContent && !document.body.classList.contains('app-files')) {
        return;
    }

    let lastRecordedPath = null;
    let lastRecordedAt = 0;

    const getPathFromElement = (element) => {
        const row = element.closest('tr[data-file], [data-file][data-path], [data-path][data-file]');
        if (row && row.dataset.file) {
            const dir = row.dataset.path || '';
            return `${dir}/${row.dataset.file}`.replace(/\/+/g, '/');
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
                return `${dir}/${scrollTo}`.replace(/\/+/g, '/');
            }
        } catch (error) {
            return null;
        }

        return null;
    };

    const recordPath = (path) => {
        if (!path) {
            return;
        }

        const now = Date.now();
        if (path === lastRecordedPath && now - lastRecordedAt < 1500) {
            return;
        }
        lastRecordedPath = path;
        lastRecordedAt = now;

        fetch(OC.generateUrl('/apps/last_opened/opened'), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                requesttoken: OC.requestToken,
            },
            body: JSON.stringify({ path }),
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

        const link = target.closest('a.name, a[href*="scrollto"], tr[data-file] a, [data-file]');
        if (!link) {
            return;
        }

        recordPath(getPathFromElement(link));
    };

    document.addEventListener('click', maybeRecord, true);
    document.addEventListener('dblclick', maybeRecord, true);
    document.addEventListener('keydown', maybeRecord, true);
})();
