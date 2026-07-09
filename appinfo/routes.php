<?php

declare(strict_types=1);

return [
    'routes' => [
        [
            'name' => 'last_opened#record',
            'url' => '/opened',
            'verb' => 'POST',
        ],
        [
            'name' => 'last_opened#index',
            'url' => '/opened',
            'verb' => 'GET',
        ],
    ],
];
