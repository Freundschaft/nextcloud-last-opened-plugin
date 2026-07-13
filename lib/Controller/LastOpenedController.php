<?php

declare(strict_types=1);

namespace OCA\LastOpened\Controller;

use OCA\LastOpened\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\Files\File;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IDBConnection;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;

class LastOpenedController extends Controller {
    private const TABLE = 'last_opened_events';
    private const MAX_HISTORY_PER_USER = 100;

    public function __construct(
        IRequest $request,
        private IDBConnection $db,
        private IRootFolder $rootFolder,
        private IUserSession $userSession,
        private IURLGenerator $urlGenerator,
    ) {
        parent::__construct(Application::APP_ID, $request);
    }

    public function record(?string $path = null, ?int $fileId = null): DataResponse {
        $user = $this->userSession->getUser();
        if ($user === null) {
            return new DataResponse(['message' => 'Authentication required'], Http::STATUS_UNAUTHORIZED);
        }

        $userFolder = $this->rootFolder->getUserFolder($user->getUID());

        if ($fileId !== null && $fileId > 0) {
            $nodes = $userFolder->getById($fileId);
            $node = $nodes[0] ?? null;
            if ($node === null) {
                return new DataResponse(['message' => 'File not found'], Http::STATUS_NOT_FOUND);
            }
            $path = $this->normalizePath($userFolder->getRelativePath($node->getPath()) ?? '');
            if ($path === '') {
                return new DataResponse(['message' => 'File not found'], Http::STATUS_NOT_FOUND);
            }
        } else {
            $path = $this->normalizePath($path ?? '');
            if ($path === '') {
                return new DataResponse(['message' => 'Missing file reference'], Http::STATUS_BAD_REQUEST);
            }

            try {
                $node = $userFolder->get($path);
            } catch (NotFoundException) {
                return new DataResponse(['message' => 'File not found'], Http::STATUS_NOT_FOUND);
            }
        }

        if (!$node instanceof File) {
            return new DataResponse(['message' => 'Only files are tracked'], Http::STATUS_BAD_REQUEST);
        }

        $now = time();
        $resolvedFileId = (int)$node->getId();
        $this->deleteExistingEntry($user->getUID(), $resolvedFileId);

        $query = $this->db->getQueryBuilder();
        $query->insert(self::TABLE)
            ->values([
                'user_id' => $query->createNamedParameter($user->getUID()),
                'file_id' => $query->createNamedParameter($resolvedFileId, IQueryBuilder::PARAM_INT),
                'path' => $query->createNamedParameter($path),
                'name' => $query->createNamedParameter($node->getName()),
                'mime_type' => $query->createNamedParameter($node->getMimetype()),
                'opened_at' => $query->createNamedParameter($now, IQueryBuilder::PARAM_INT),
            ]);
        $query->executeStatement();

        $this->trimHistory($user->getUID());

        return new DataResponse(['status' => 'ok']);
    }

    public function index(int $limit = 15): DataResponse {
        $user = $this->userSession->getUser();
        if ($user === null) {
            return new DataResponse(['message' => 'Authentication required'], Http::STATUS_UNAUTHORIZED);
        }

        $limit = max(1, min(50, $limit));
        $query = $this->db->getQueryBuilder();
        $query->select('file_id', 'path', 'name', 'mime_type', 'opened_at')
            ->from(self::TABLE)
            ->where($query->expr()->eq('user_id', $query->createNamedParameter($user->getUID())))
            ->orderBy('opened_at', 'DESC')
            ->setMaxResults($limit);

        $result = $query->executeQuery();
        $files = [];
        while ($row = $result->fetch()) {
            $files[] = [
                'fileId' => (int)$row['file_id'],
                'path' => $row['path'],
                'name' => $row['name'],
                'mimeType' => $row['mime_type'],
                'openedAt' => (int)$row['opened_at'],
                'url' => $this->buildFileUrl((string)$row['path']),
            ];
        }
        $result->closeCursor();

        return new DataResponse(['files' => $files]);
    }

    private function normalizePath(string $path): string {
        $path = trim($path);
        $path = preg_replace('#/+#', '/', $path) ?? '';
        return ltrim($path, '/');
    }

    private function deleteExistingEntry(string $userId, int $fileId): void {
        $query = $this->db->getQueryBuilder();
        $query->delete(self::TABLE)
            ->where($query->expr()->eq('user_id', $query->createNamedParameter($userId)))
            ->andWhere($query->expr()->eq('file_id', $query->createNamedParameter($fileId, IQueryBuilder::PARAM_INT)));
        $query->executeStatement();
    }

    private function trimHistory(string $userId): void {
        $query = $this->db->getQueryBuilder();
        $query->select('id')
            ->from(self::TABLE)
            ->where($query->expr()->eq('user_id', $query->createNamedParameter($userId)))
            ->orderBy('opened_at', 'DESC')
            ->setFirstResult(self::MAX_HISTORY_PER_USER)
            ->setMaxResults(1000);

        $result = $query->executeQuery();
        $ids = [];
        while ($row = $result->fetch()) {
            $ids[] = (int)$row['id'];
        }
        $result->closeCursor();

        if ($ids === []) {
            return;
        }

        $delete = $this->db->getQueryBuilder();
        $delete->delete(self::TABLE)
            ->where($delete->expr()->in('id', $delete->createNamedParameter($ids, IQueryBuilder::PARAM_INT_ARRAY)));
        $delete->executeStatement();
    }

    private function buildFileUrl(string $path): string {
        $dir = dirname($path);
        if ($dir === '.') {
            $dir = '/';
        } else {
            $dir = '/' . ltrim($dir, '/');
        }

        return $this->urlGenerator->linkToRoute('files.view.index', [
            'dir' => $dir,
            'scrollto' => basename($path),
        ]);
    }
}
