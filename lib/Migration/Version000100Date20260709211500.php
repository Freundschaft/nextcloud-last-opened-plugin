<?php

declare(strict_types=1);

namespace OCA\LastOpened\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

class Version000100Date20260709211500 extends SimpleMigrationStep {
    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if ($schema->hasTable('last_opened_events')) {
            return null;
        }

        $table = $schema->createTable('last_opened_events');
        $table->addColumn('id', 'bigint', [
            'autoincrement' => true,
            'notnull' => true,
            'unsigned' => true,
        ]);
        $table->addColumn('user_id', 'string', [
            'notnull' => true,
            'length' => 64,
        ]);
        $table->addColumn('file_id', 'bigint', [
            'notnull' => true,
            'unsigned' => true,
        ]);
        $table->addColumn('path', 'string', [
            'notnull' => true,
            'length' => 4000,
        ]);
        $table->addColumn('name', 'string', [
            'notnull' => true,
            'length' => 255,
        ]);
        $table->addColumn('mime_type', 'string', [
            'notnull' => true,
            'length' => 255,
        ]);
        $table->addColumn('opened_at', 'integer', [
            'notnull' => true,
            'unsigned' => true,
        ]);
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['user_id', 'file_id'], 'loe_user_file_idx');
        $table->addIndex(['user_id', 'opened_at'], 'loe_user_opened_idx');

        return $schema;
    }
}
