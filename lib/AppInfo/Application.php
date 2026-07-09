<?php

declare(strict_types=1);

namespace OCA\LastOpened\AppInfo;

use OCA\LastOpened\Dashboard\LastOpenedWidget;
use OCA\LastOpened\Listener\BeforeTemplateRenderedListener;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;

class Application extends App implements IBootstrap {
    public const APP_ID = 'last_opened';

    public function __construct(array $urlParams = []) {
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerDashboardWidget(LastOpenedWidget::class);
        $context->registerEventListener(BeforeTemplateRenderedEvent::class, BeforeTemplateRenderedListener::class);
    }

    public function boot(IBootContext $context): void {
    }
}
