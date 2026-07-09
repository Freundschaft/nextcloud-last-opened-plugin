(function() {
    'use strict';

    if (!window.OCA || !OCA.Dashboard || !window.OC || !OC.generateUrl) {
        return;
    }

    const escapeText = (value) => {
        const span = document.createElement('span');
        span.textContent = value;
        return span.innerHTML;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const iconClass = (mimeType) => {
        if (mimeType && mimeType.startsWith('image/')) {
            return 'icon-filetype-image';
        }
        if (mimeType === 'application/pdf') {
            return 'icon-filetype-pdf';
        }
        if (mimeType && mimeType.startsWith('text/')) {
            return 'icon-filetype-text';
        }
        return 'icon-file';
    };

    const renderFiles = (element, files) => {
        if (files.length === 0) {
            element.innerHTML = '<div class="last-opened-empty">No opened files recorded yet.</div>';
            return;
        }

        element.innerHTML = `
            <ul class="last-opened-list">
                ${files.map((file) => `
                    <li class="last-opened-item">
                        <a class="last-opened-link" href="${escapeText(file.url)}">
                            <span class="last-opened-icon ${iconClass(file.mimeType)}"></span>
                            <span class="last-opened-main">
                                <span class="last-opened-name">${escapeText(file.name)}</span>
                                <span class="last-opened-path">${escapeText(file.path)}</span>
                            </span>
                            <time class="last-opened-time" datetime="${new Date(file.openedAt * 1000).toISOString()}">${escapeText(formatTime(file.openedAt))}</time>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    };

    OCA.Dashboard.register('last_opened', (element) => {
        element.innerHTML = '<div class="last-opened-loading icon-loading-small">Loading recently opened files...</div>';

        fetch(OC.generateUrl('/apps/last_opened/opened?limit=15'), {
            credentials: 'same-origin',
            headers: {
                requesttoken: OC.requestToken,
            },
        })
            .then((response) => response.ok ? response.json() : Promise.reject(response))
            .then((data) => renderFiles(element, data.files || []))
            .catch(() => {
                element.innerHTML = '<div class="last-opened-empty">Could not load recently opened files.</div>';
            });
    });
})();
