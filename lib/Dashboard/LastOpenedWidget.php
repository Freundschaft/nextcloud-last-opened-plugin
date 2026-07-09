<?php

declare(strict_types=1);

namespace OCA\LastOpened\Dashboard;

use OCA\LastOpened\AppInfo\Application;
use OCP\Dashboard\IWidget;
use OCP\IL10N;
use OCP\Util;

class LastOpenedWidget implements IWidget {
    public function __construct(
        private IL10N $l10n,
    ) {
    }

    public function getId(): string {
        return Application::APP_ID;
    }

    public function getTitle(): string {
        return $this->l10n->t('Last opened files');
    }

    public function getOrder(): int {
        return 20;
    }

    public function getIconClass(): string {
        return 'icon-files-dark';
    }

    public function getUrl(): ?string {
        return null;
    }

    public function load(): void {
        Util::addScript(Application::APP_ID, 'dashboard');
        Util::addStyle(Application::APP_ID, 'dashboard');
    }
}
