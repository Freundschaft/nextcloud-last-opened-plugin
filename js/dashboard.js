(function() {
    'use strict';

    if (!window.OCA || !OCA.Dashboard || !window.OC || !OC.generateUrl) {
        return;
    }

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

    const navigate = (url) => {
        window.location.assign(url);
    };

    let currentContextMenu = null;

    const showError = (element, message) => {
        element.querySelector('.last-opened-error')?.remove();
        const error = document.createElement('div');
        error.className = 'last-opened-error';
        error.setAttribute('role', 'alert');
        error.textContent = message;
        element.prepend(error);
        window.setTimeout(() => error.remove(), 5000);
    };

    const createContextMenu = (element, deleteEntry) => {
        currentContextMenu?.destroy();
        const listeners = new AbortController();

        const menu = document.createElement('div');
        menu.id = 'last-opened-context-menu';
        menu.className = 'last-opened-context-menu';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;

        const actions = [
            { id: 'open', label: 'Open file', icon: 'icon-file' },
            { id: 'folder', label: 'Show in folder', icon: 'icon-folder' },
            { id: 'details', label: 'Show information', icon: 'icon-info' },
            { id: 'delete', label: 'Delete entry', icon: 'icon-delete', destructive: true },
        ];

        actions.forEach((action) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'last-opened-menu-action';
            button.dataset.action = action.id;
            button.setAttribute('role', 'menuitem');
            if (action.destructive) {
                button.classList.add('last-opened-menu-action--destructive');
            }

            const icon = document.createElement('span');
            icon.className = `last-opened-menu-icon ${action.icon}`;
            icon.setAttribute('aria-hidden', 'true');
            button.append(icon, document.createTextNode(action.label));
            menu.append(button);
        });

        document.body.append(menu);

        let activeFile = null;
        let activeTrigger = null;

        const closeMenu = (restoreFocus = false) => {
            menu.hidden = true;
            activeFile = null;
            if (restoreFocus) {
                activeTrigger?.focus();
            }
            activeTrigger?.setAttribute('aria-expanded', 'false');
            activeTrigger = null;
        };

        const openMenu = (file, x, y, trigger = null) => {
            activeFile = file;
            activeTrigger = trigger;
            activeTrigger?.setAttribute('aria-expanded', 'true');
            menu.hidden = false;

            const margin = 8;
            const left = Math.min(x, window.innerWidth - menu.offsetWidth - margin);
            const top = Math.min(y, window.innerHeight - menu.offsetHeight - margin);
            menu.style.left = `${Math.max(margin, left)}px`;
            menu.style.top = `${Math.max(margin, top)}px`;
            menu.querySelector('.last-opened-menu-action')?.focus();
        };

        menu.addEventListener('click', async (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const button = target?.closest('.last-opened-menu-action');
            if (!button || !activeFile) {
                return;
            }

            const file = activeFile;
            const action = button.dataset.action;
            closeMenu();

            if (action === 'open') {
                navigate(file.url);
            } else if (action === 'folder') {
                navigate(file.folderUrl);
            } else if (action === 'details') {
                navigate(file.detailsUrl);
            } else if (action === 'delete') {
                await deleteEntry(file);
            }
        }, { signal: listeners.signal });

        menu.addEventListener('keydown', (event) => {
            const items = [...menu.querySelectorAll('.last-opened-menu-action')];
            const current = items.indexOf(document.activeElement);

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu(true);
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const offset = event.key === 'ArrowDown' ? 1 : -1;
                items[(current + offset + items.length) % items.length]?.focus();
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                items[event.key === 'Home' ? 0 : items.length - 1]?.focus();
            }
        }, { signal: listeners.signal });

        document.addEventListener('pointerdown', (event) => {
            if (!menu.hidden && !menu.contains(event.target)) {
                closeMenu();
            }
        }, { signal: listeners.signal });
        window.addEventListener('resize', () => closeMenu(), { signal: listeners.signal });
        window.addEventListener('scroll', () => closeMenu(), { capture: true, signal: listeners.signal });

        const contextMenu = {
            openMenu,
            closeMenu,
            destroy: () => {
                listeners.abort();
                menu.remove();
            },
        };
        currentContextMenu = contextMenu;
        return contextMenu;
    };

    const renderFiles = (element, files, contextMenu) => {
        element.replaceChildren();
        contextMenu.closeMenu();

        if (files.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'last-opened-empty';
            empty.textContent = 'No opened files recorded yet.';
            element.append(empty);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'last-opened-list';

        files.forEach((file) => {
            const item = document.createElement('li');
            item.className = 'last-opened-item';

            const link = document.createElement('a');
            link.className = 'last-opened-link';
            link.href = file.url;

            const icon = document.createElement('span');
            icon.className = `last-opened-icon ${iconClass(file.mimeType)}`;
            icon.setAttribute('aria-hidden', 'true');

            const main = document.createElement('span');
            main.className = 'last-opened-main';
            const name = document.createElement('span');
            name.className = 'last-opened-name';
            name.textContent = file.name;
            const path = document.createElement('span');
            path.className = 'last-opened-path';
            path.textContent = file.path;
            const time = document.createElement('time');
            time.className = 'last-opened-time';
            time.dateTime = new Date(file.openedAt * 1000).toISOString();
            time.textContent = formatTime(file.openedAt);
            main.append(name, path, time);
            link.append(icon, main);

            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'last-opened-menu-trigger icon-more';
            trigger.title = 'File actions';
            trigger.setAttribute('aria-label', `Actions for ${file.name}`);
            trigger.setAttribute('aria-haspopup', 'menu');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                const rect = trigger.getBoundingClientRect();
                contextMenu.openMenu(file, rect.right, rect.bottom, trigger);
            });

            item.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                contextMenu.openMenu(file, event.clientX, event.clientY, trigger);
            });

            item.append(link, trigger);
            list.append(item);
        });

        element.append(list);
    };

    OCA.Dashboard.register('last_opened', (element) => {
        let files = [];

        const contextMenu = createContextMenu(element, async (file) => {
            try {
                const response = await fetch(OC.generateUrl(`/apps/last_opened/opened/${file.fileId}`), {
                    method: 'DELETE',
                    credentials: 'same-origin',
                    headers: {
                        requesttoken: OC.requestToken,
                    },
                });
                if (!response.ok) {
                    throw new Error(`History deletion failed with status ${response.status}`);
                }
                files = files.filter((entry) => entry.fileId !== file.fileId);
                renderFiles(element, files, contextMenu);
            } catch (error) {
                showError(element, 'Could not remove the history entry.');
            }
        });

        const loading = document.createElement('div');
        loading.className = 'last-opened-loading icon-loading-small';
        loading.textContent = 'Loading recently opened files...';
        element.replaceChildren(loading);

        fetch(OC.generateUrl('/apps/last_opened/opened?limit=15'), {
            credentials: 'same-origin',
            headers: {
                requesttoken: OC.requestToken,
            },
        })
            .then((response) => response.ok ? response.json() : Promise.reject(response))
            .then((data) => {
                files = data.files || [];
                renderFiles(element, files, contextMenu);
            })
            .catch(() => {
                const error = document.createElement('div');
                error.className = 'last-opened-empty';
                error.textContent = 'Could not load recently opened files.';
                element.replaceChildren(error);
            });
    });
})();
