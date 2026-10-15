<?php

function likhon_config(): array {
  static $config;
  if (is_array($config)) {
    return $config;
  }
  $file = dirname(__DIR__) . '/config.php';
  $defaults = [
    'site_url' => 'https://www.likhontools.com',
    'cache_ttl_seconds' => 60,
    'convert_enabled' => false,
    'convert_url' => '',
    'convert_key' => '',
    'convert_max_upload_mb' => 20,
    'convert_rate_limit_per_minute' => 8,
    'convert_timeout_seconds' => 120,
  ];
  if (is_file($file)) {
    $loaded = include $file;
    if (is_array($loaded)) {
      $config = array_merge($defaults, $loaded);
      return $config;
    }
  }
  $config = $defaults;
  return $config;
}

function likhon_is_localized($value): bool {
  return is_array($value)
    && isset($value['bn'], $value['en'])
    && is_string($value['bn']) && trim($value['bn']) !== ''
    && is_string($value['en']) && trim($value['en']) !== '';
}

function likhon_string_list($value, string $path, array &$issues): array {
  if (!is_array($value)) {
    $issues[] = ['path' => $path, 'message' => 'must be an array of strings'];
    return [];
  }
  $items = [];
  foreach ($value as $i => $item) {
    if (!is_string($item) || trim($item) === '') {
      $issues[] = ['path' => $path . '[' . $i . ']', 'message' => 'must be a non-empty string'];
      continue;
    }
    $items[] = trim($item);
  }
  return $items;
}

function likhon_validate_manifest($input, string $folderSlug): array {
  $issues = [];
  $categories = ['text', 'image', 'calculator', 'converter', 'document'];
  $runtimes = ['client', 'server'];
  $slugRe = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';
  $versionRe = '/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.]+)?$/';

  if (!is_array($input)) {
    return ['ok' => false, 'issues' => [['path' => '', 'message' => 'module.json must be a JSON object']]];
  }

  $id = $input['id'] ?? null;
  $slug = $input['slug'] ?? null;
  if (!is_string($id) || !preg_match($slugRe, $id)) {
    $issues[] = ['path' => 'id', 'message' => 'must be a kebab-case slug'];
  }
  if (!is_string($slug) || !preg_match($slugRe, $slug)) {
    $issues[] = ['path' => 'slug', 'message' => 'must be a kebab-case slug'];
  }
  if (is_string($id) && is_string($slug) && $id !== $slug) {
    $issues[] = ['path' => 'id', 'message' => 'must match slug'];
  }
  if (is_string($slug) && $slug !== $folderSlug) {
    $issues[] = ['path' => 'slug', 'message' => 'must match folder name (' . $folderSlug . ')'];
  }
  if (!isset($input['version']) || !is_string($input['version']) || !preg_match($versionRe, $input['version'])) {
    $issues[] = ['path' => 'version', 'message' => 'must be a semver string such as 1.0.0'];
  }
  if (!array_key_exists('enabled', $input) || !is_bool($input['enabled'])) {
    $issues[] = ['path' => 'enabled', 'message' => 'must be true or false'];
  }
  if (!isset($input['category']) || !in_array($input['category'], $categories, true)) {
    $issues[] = ['path' => 'category', 'message' => 'must be one of: ' . implode(', ', $categories)];
  }
  if (!isset($input['icon']) || !is_string($input['icon']) || trim($input['icon']) === '') {
    $issues[] = ['path' => 'icon', 'message' => 'must be a non-empty string'];
  }
  if (!likhon_is_localized($input['name'] ?? null)) {
    $issues[] = ['path' => 'name', 'message' => 'must be an object with bn and en strings'];
  }
  if (!likhon_is_localized($input['description'] ?? null)) {
    $issues[] = ['path' => 'description', 'message' => 'must be an object with bn and en strings'];
  }
  $keywords = likhon_string_list($input['keywords'] ?? null, 'keywords', $issues);
  if (!isset($input['runtime']) || !in_array($input['runtime'], $runtimes, true)) {
    $issues[] = ['path' => 'runtime', 'message' => 'must be "client" or "server"'];
  }
  $accept = likhon_string_list($input['accept'] ?? null, 'accept', $issues);
  if (!isset($input['maxFileSizeMB']) || !is_numeric($input['maxFileSizeMB']) || (float) $input['maxFileSizeMB'] <= 0) {
    $issues[] = ['path' => 'maxFileSizeMB', 'message' => 'must be a positive number'];
  }
  $libs = likhon_string_list($input['libs'] ?? null, 'libs', $issues);
  $seo = $input['seo'] ?? null;
  if (!is_array($seo) || !likhon_is_localized($seo['title'] ?? null) || !likhon_is_localized($seo['description'] ?? null)) {
    $issues[] = ['path' => 'seo', 'message' => 'must include title and description with bn and en'];
  }

  if ($issues) {
    return ['ok' => false, 'issues' => $issues];
  }

  return [
    'ok' => true,
    'manifest' => [
      'id' => $id,
      'slug' => $slug,
      'version' => $input['version'],
      'enabled' => $input['enabled'],
      'category' => $input['category'],
      'icon' => trim($input['icon']),
      'name' => ['bn' => trim($input['name']['bn']), 'en' => trim($input['name']['en'])],
      'description' => ['bn' => trim($input['description']['bn']), 'en' => trim($input['description']['en'])],
      'keywords' => $keywords,
      'runtime' => $input['runtime'],
      'accept' => $accept,
      'maxFileSizeMB' => (float) $input['maxFileSizeMB'],
      'libs' => $libs,
      'seo' => [
        'title' => ['bn' => trim($seo['title']['bn']), 'en' => trim($seo['title']['en'])],
        'description' => ['bn' => trim($seo['description']['bn']), 'en' => trim($seo['description']['en'])],
      ],
    ],
  ];
}

function likhon_modules_root(): string {
  return dirname(__DIR__) . '/modules';
}

function likhon_cache_dir(): string {
  $dir = __DIR__ . '/.cache';
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }
  return $dir;
}

function likhon_scan_modules(): array {
  $root = likhon_modules_root();
  $modules = [];
  $skipped = [];
  $newest = 0;

  if (!is_dir($root)) {
    return ['modules' => [], 'skipped' => [], 'newestMtime' => 0];
  }

  $entries = @scandir($root) ?: [];
  foreach ($entries as $name) {
    if ($name === '.' || $name === '..' || $name[0] === '_' || $name[0] === '.') {
      continue;
    }
    $folder = $root . '/' . $name;
    if (!is_dir($folder)) {
      continue;
    }
    $manifestPath = $folder . '/module.json';
    if (!is_file($manifestPath)) {
      $skipped[] = ['slug' => $name, 'issues' => [['path' => 'module.json', 'message' => 'missing module.json']]];
      continue;
    }
    $mtime = @filemtime($manifestPath) ?: 0;
    if ($mtime > $newest) {
      $newest = $mtime;
    }
    $raw = @file_get_contents($manifestPath);
    $parsed = json_decode((string) $raw, true);
    if (!is_array($parsed)) {
      $skipped[] = ['slug' => $name, 'issues' => [['path' => 'module.json', 'message' => 'invalid JSON']]];
      continue;
    }
    $result = likhon_validate_manifest($parsed, $name);
    if (!$result['ok']) {
      $skipped[] = ['slug' => $name, 'issues' => $result['issues']];
      continue;
    }
    $modules[] = $result['manifest'];
  }

  usort($modules, static fn ($a, $b) => strcmp($a['slug'], $b['slug']));
  return ['modules' => $modules, 'skipped' => $skipped, 'newestMtime' => $newest];
}

function likhon_registry(bool $enabledOnly = true): array {
  $config = likhon_config();
  $cacheFile = likhon_cache_dir() . '/modules.json';
  $scanHint = 0;
  $root = likhon_modules_root();
  if (is_dir($root)) {
    foreach (@scandir($root) ?: [] as $name) {
      if ($name === '.' || $name === '..' || $name[0] === '_') {
        continue;
      }
      $manifest = $root . '/' . $name . '/module.json';
      if (is_file($manifest)) {
        $mtime = @filemtime($manifest) ?: 0;
        if ($mtime > $scanHint) {
          $scanHint = $mtime;
        }
      }
    }
  }

  if (is_file($cacheFile)) {
    $cached = json_decode((string) file_get_contents($cacheFile), true);
    if (is_array($cached) && (int) ($cached['newestMtime'] ?? 0) === (int) $scanHint) {
      $ttl = (int) $config['cache_ttl_seconds'];
      $age = time() - (int) ($cached['cachedAt'] ?? 0);
      if ($ttl <= 0 || $age <= $ttl) {
        $payload = $cached;
        if ($enabledOnly) {
          $payload['modules'] = array_values(array_filter(
            $payload['modules'] ?? [],
            static fn ($m) => !empty($m['enabled'])
          ));
        }
        return $payload;
      }
    }
  }

  $scan = likhon_scan_modules();
  $payload = [
    'modules' => $scan['modules'],
    'skipped' => $scan['skipped'],
    'newestMtime' => $scan['newestMtime'],
    'cachedAt' => time(),
    'generatedAt' => gmdate('c'),
  ];
  @file_put_contents($cacheFile, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

  if ($enabledOnly) {
    $payload['modules'] = array_values(array_filter(
      $payload['modules'],
      static fn ($m) => !empty($m['enabled'])
    ));
  }
  return $payload;
}

function likhon_find_module(string $slug): ?array {
  $registry = likhon_registry(false);
  foreach ($registry['modules'] as $module) {
    if (($module['slug'] ?? '') === $slug && !empty($module['enabled'])) {
      return $module;
    }
  }
  return null;
}

function likhon_xml_escape(string $value): string {
  return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function likhon_static_paths(): array {
  return [
    '/',
    '/bangla-typing',
    '/converter',
    '/image-resizer',
    '/passport-photo',
    '/age-calculator',
    '/cgpa-calculator',
    '/contact',
    '/advertise',
  ];
}
