<?php
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=300');

try {
  require __DIR__ . '/_lib.php';
  $config = likhon_config();
  $origin = rtrim((string) $config['site_url'], '/');
  $registry = likhon_registry(true);
  $today = gmdate('Y-m-d');

  echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
  foreach (likhon_static_paths() as $path) {
    $priority = $path === '/' ? '1.0' : '0.8';
    echo "  <url>\n";
    echo '    <loc>' . likhon_xml_escape($origin . $path) . "</loc>\n";
    echo "    <lastmod>{$today}</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>{$priority}</priority>\n";
    echo "  </url>\n";
  }
  foreach ($registry['modules'] as $module) {
    echo "  <url>\n";
    echo '    <loc>' . likhon_xml_escape($origin . '/tool/' . $module['slug']) . "</loc>\n";
    echo "    <lastmod>{$today}</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.7</priority>\n";
    echo "  </url>\n";
  }
  echo "</urlset>\n";
} catch (Throwable $e) {
  echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>\n";
}
