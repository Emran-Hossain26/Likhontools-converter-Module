<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
header('Access-Control-Allow-Origin: *');

try {
  require __DIR__ . '/_lib.php';
  $payload = likhon_registry(true);
  echo json_encode([
    'modules' => $payload['modules'] ?? [],
    'skipped' => $payload['skipped'] ?? [],
    'generatedAt' => $payload['generatedAt'] ?? gmdate('c'),
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  http_response_code(200);
  echo json_encode([
    'modules' => [],
    'skipped' => [['slug' => '_scanner', 'issues' => [['path' => '', 'message' => 'registry failed']]]],
    'generatedAt' => gmdate('c'),
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
