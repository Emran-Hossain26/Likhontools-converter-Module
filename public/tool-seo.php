<?php
require __DIR__ . '/api/_lib.php';

$slug = isset($_GET['slug']) ? (string) $_GET['slug'] : '';
if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
  $slug = '';
}

$htmlFile = __DIR__ . '/index.html';
$html = is_file($htmlFile) ? (string) file_get_contents($htmlFile) : '';
if ($html === '') {
  http_response_code(500);
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Missing index.html';
  exit;
}

$module = $slug !== '' ? likhon_find_module($slug) : null;
if ($module) {
  $title = $module['seo']['title']['bn'] ?? $module['name']['bn'];
  $description = $module['seo']['description']['bn'] ?? $module['description']['bn'];
  $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
  $description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
  $html = preg_replace('/<title>.*?<\/title>/is', '<title>' . $title . '</title>', $html, 1) ?? $html;
  $inject = '<meta name="description" content="' . $description . '">'
    . '<meta property="og:title" content="' . $title . '">'
    . '<meta property="og:description" content="' . $description . '">';
  if (stripos($html, '</head>') !== false) {
    $html = str_ireplace('</head>', $inject . '</head>', $html);
  }
}

header('Content-Type: text/html; charset=utf-8');
echo $html;
