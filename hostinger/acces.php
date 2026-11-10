<?php
declare(strict_types=1);

/**
 * AxioMaths — portier de maths.datagrade.fr/alea/ (déployé en alea/index.php).
 *
 * L'application MathALÉA est un site statique : ce script est servi à la place
 * de index.html (DirectoryIndex) et décide qui peut l'ouvrir.
 *
 *   - Un jeton `dg=<expiration>.<signature>` dans l'adresse, signé par DataGrade,
 *     ouvre l'accès et pose un cookie pour la journée.
 *   - Le cookie `axio_acces`, signé par ce site, suffit ensuite : les liens
 *     internes de MathALÉA (nouvel onglet, vue élève…) fonctionnent sans jeton.
 *   - Sans l'un ni l'autre : page d'explication qui renvoie vers DataGrade.
 *
 * Aucune clé n'est à recopier : DataGrade signe ses jetons avec une clé privée
 * (Ed25519) qu'il crée lui-même, et ce portier lit la clé PUBLIQUE correspondante
 * à l'adresse AXIO_KEY_URL, puis la garde en cache (alea/acces-cle.json). Une clé
 * publique ne permet que de vérifier une signature : elle n'a rien de secret.
 *
 * L'ancien mode (clé partagée du secret AXIO_GATE_SECRET, jetons HMAC) reste
 * accepté s'il est configuré. Pour rouvrir le site à tous, le workflow écrit
 * `ouvert` dans alea/acces-config.php (variable de dépôt AXIO_PORTIER=ouvert).
 *
 * Les fichiers (JavaScript, images, annales) restent servis directement : ils
 * sont inutilisables sans cette page.
 */

const AXIO_COOKIE      = 'axio_acces';
const AXIO_COOKIE_TTL  = 12 * 3600; // durée d'une journée de classe
const AXIO_TOKEN_SKEW  = 120;       // tolérance d'horloge sur l'expiration du jeton
const AXIO_KEY_URL     = 'https://datagrade.fr/api/axiomaths-cle.php';
const AXIO_KEY_TTL     = 6 * 3600;  // durée de vie du cache de la clé publique
const AXIO_KEY_RETRY   = 60;        // délai minimal entre deux lectures de la clé chez DataGrade
const AXIO_KEY_CACHE   = __DIR__ . '/acces-cle.json';
const AXIO_LOCAL_KEY   = __DIR__ . '/acces-local.php';

$config = @include __DIR__ . '/acces-config.php';
$config = is_array($config) ? $config : [];
$secret = trim((string) ($config['secret'] ?? ''));

function axio_sign(string $secret, string $purpose, string $expires): string
{
    return substr(hash_hmac('sha256', $purpose . '|' . $expires, $secret), 0, 32);
}

/**
 * Vérifie une valeur `<expiration>.<signature HMAC>` (cookie, ou jeton de l'ancien mode).
 * @return string '' si elle est valide, sinon le motif du refus : 'format', 'expire' ou 'signature'
 */
function axio_check(string $secret, string $purpose, string $value, int $skew = 0): string
{
    if (!preg_match('/^(\d{9,12})\.([0-9a-f]{32})$/', $value, $m)) return 'format';
    if (!hash_equals(axio_sign($secret, $purpose, $m[1]), $m[2])) return 'signature';
    if ((int) $m[1] + $skew < time()) return 'expire';
    return '';
}

/** Écrit un fichier d'un seul coup (jamais de fichier à moitié écrit en cas d'accès simultanés). */
function axio_write(string $path, string $content): bool
{
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (@file_put_contents($tmp, $content, LOCK_EX) === false) return false;
    @chmod($tmp, 0600);
    if (@rename($tmp, $path)) return true;
    @unlink($tmp);
    return false;
}

/**
 * Lit la clé publique chez DataGrade (HTTPS, certificat vérifié).
 * @return array{cle:?string, erreur:string} clé brute de 32 octets, ou la raison de l'échec
 */
function axio_fetch_key(): array
{
    $body = false;
    $erreur = '';
    if (function_exists('curl_init')) {
        $ch = curl_init(AXIO_KEY_URL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => 'AxioMaths-portier',
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($body === false) $erreur = 'connexion impossible (' . curl_error($ch) . ')';
        elseif ($code !== 200) { $erreur = 'réponse HTTP ' . $code; $body = false; }
        curl_close($ch);
    } else {
        $body = @file_get_contents(AXIO_KEY_URL, false, stream_context_create(['http' => ['timeout' => 6, 'user_agent' => 'AxioMaths-portier']]));
        if ($body === false) $erreur = 'connexion impossible';
    }
    if ($body === false) return ['cle' => null, 'erreur' => $erreur];
    $json = json_decode((string) $body, true);
    $cle = is_array($json) && ($json['alg'] ?? '') === 'ed25519' && is_string($json['cle'] ?? null)
        ? base64_decode($json['cle'], true) : false;
    if ($cle === false || strlen($cle) !== 32) return ['cle' => null, 'erreur' => 'réponse inattendue de DataGrade'];
    return ['cle' => $cle, 'erreur' => ''];
}

/**
 * Clé publique de DataGrade, depuis le cache ou depuis DataGrade.
 * $force : relire chez DataGrade même si le cache est encore valable (signature
 * refusée : la clé a peut-être changé), sans dépasser une lecture par minute.
 * @return array{cle:?string, erreur:string, lue:int}
 */
function axio_public_key(bool $force = false): array
{
    $cache = json_decode((string) @file_get_contents(AXIO_KEY_CACHE), true);
    $cache = is_array($cache) ? $cache : [];
    $lue = (int) ($cache['lue'] ?? 0);
    $cle = is_string($cache['cle'] ?? null) ? base64_decode($cache['cle'], true) : false;
    $cle = ($cle !== false && strlen($cle) === 32) ? $cle : null;
    $age = time() - $lue;
    $perime = $cle === null || $age > AXIO_KEY_TTL;
    if ($age >= 0 && $age < AXIO_KEY_RETRY) $force = $perime = false; // pas plus d'une lecture par minute
    if (!$force && !$perime) return ['cle' => $cle, 'erreur' => (string) ($cache['erreur'] ?? ''), 'lue' => $lue];
    $lu = axio_fetch_key();
    // En cas d'échec, on garde la dernière clé connue : DataGrade peut être momentanément injoignable.
    $garde = $lu['cle'] ?? $cle;
    axio_write(AXIO_KEY_CACHE, json_encode([
        'cle' => $garde === null ? null : base64_encode($garde), 'lue' => time(), 'erreur' => $lu['erreur'],
    ]));
    return ['cle' => $garde, 'erreur' => $lu['erreur'], 'lue' => time()];
}

/**
 * Vérifie un jeton `<expiration>.<signature Ed25519 en base64url>` avec la clé publique de DataGrade.
 * @return string '' s'il est valide, sinon 'format', 'sodium', 'cle', 'signature' ou 'expire'
 */
function axio_check_signed(string $value, int $skew): string
{
    if (!preg_match('/^(\d{9,12})\.([A-Za-z0-9_-]{86})$/', $value, $m)) return 'format';
    if (!function_exists('sodium_crypto_sign_verify_detached')) return 'sodium';
    $signature = base64_decode(strtr($m[2], '-_', '+/') . '==', true);
    if ($signature === false || strlen($signature) !== 64) return 'format';
    $message = 'acces|' . $m[1];
    $cle = axio_public_key()['cle'];
    $valide = $cle !== null && sodium_crypto_sign_verify_detached($signature, $message, $cle);
    if (!$valide) {
        $nouvelle = axio_public_key(true)['cle'];
        if ($nouvelle === null) return 'cle';
        if ($nouvelle === $cle || !sodium_crypto_sign_verify_detached($signature, $message, $nouvelle)) return 'signature';
    }
    if ((int) $m[1] + $skew < time()) return 'expire';
    return '';
}

/**
 * Clé de signature des cookies, propre à ce site : la clé partagée si elle existe
 * (stable d'un déploiement à l'autre), sinon une clé aléatoire créée au premier besoin.
 */
function axio_cookie_key(string $secret): ?string
{
    if ($secret !== '') return $secret;
    $cle = @include AXIO_LOCAL_KEY;
    if (is_string($cle) && preg_match('/^[0-9a-f]{64}$/', $cle)) return $cle;
    $cle = bin2hex(random_bytes(32));
    return axio_write(AXIO_LOCAL_KEY, "<?php\nreturn '" . $cle . "';\n") ? $cle : null;
}

/** Empreinte publique d'une clé (six caractères), pour comparer deux clés sans les afficher. */
function axio_fingerprint(string $key): string
{
    return substr(hash('sha256', 'axiomaths-empreinte|' . $key), 0, 6);
}

function axio_serve_app(): never
{
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    readfile(__DIR__ . '/index.html');
    exit;
}

// Site volontairement ouvert à tous (variable de dépôt AXIO_PORTIER=ouvert).
if (!empty($config['ouvert'])) axio_serve_app();

$token = (string) ($_GET['dg'] ?? '');
if ($token === '') {
    $tokenProblem = 'absent';
} elseif ($secret !== '' && preg_match('/^\d{9,12}\.[0-9a-f]{32}$/', $token)) {
    $tokenProblem = axio_check($secret, 'acces', $token, AXIO_TOKEN_SKEW); // ancien mode, clé partagée
} else {
    $tokenProblem = axio_check_signed($token, AXIO_TOKEN_SKEW);
}
$cookieKey = axio_cookie_key($secret);
if ($tokenProblem === '') {
    if ($cookieKey !== null) {
        $expires = (string) (time() + AXIO_COOKIE_TTL);
        setcookie(AXIO_COOKIE, $expires . '.' . axio_sign($cookieKey, 'cookie', $expires), [
            'expires'  => (int) $expires,
            'path'     => '/alea/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax', // datagrade.fr et maths.datagrade.fr sont le même site : l'iframe est autorisée
        ]);
    }
    axio_serve_app();
}

$cookie = (string) ($_COOKIE[AXIO_COOKIE] ?? '');
if ($cookie !== '' && $cookieKey !== null && axio_check($cookieKey, 'cookie', $cookie) === '') axio_serve_app();

// Refus : explication et retour vers DataGrade. Le motif et l'état de la clé
// publique aident à comprendre un refus qui apparaîtrait DANS DataGrade ; ils ne
// révèlent rien de secret.
$etatCle = axio_public_key();
$motifs = [
    'absent'    => 'aucun jeton reçu : le lien ne vient pas de DataGrade, ou DataGrade n\'est pas à jour',
    'format'    => 'jeton illisible',
    'signature' => 'jeton signé avec une autre clé que celle de DataGrade',
    'expire'    => 'jeton expiré : recharge la page DataGrade',
    'cle'       => 'la clé publique de DataGrade n\'a pas pu être lue',
    'sodium'    => 'extension PHP « sodium » absente sur ce serveur',
];
$motif = $motifs[$tokenProblem] ?? $tokenProblem;
if (!function_exists('sodium_crypto_sign_verify_detached')) {
    $diagCle = 'vérification impossible, extension PHP « sodium » absente';
} elseif ($etatCle['cle'] !== null) {
    $diagCle = 'reçue, empreinte ' . axio_fingerprint($etatCle['cle']) . ($etatCle['erreur'] !== '' ? ' (dernière lecture en échec : ' . $etatCle['erreur'] . ')' : '');
} else {
    $diagCle = 'non reçue' . ($etatCle['erreur'] !== '' ? ' (' . $etatCle['erreur'] . ')' : '');
}
http_response_code(403);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AxioMaths · accès par DataGrade</title>
<link rel="icon" type="image/png" href="/favicon/favicon-96x96.png">
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #f6f3ff; color: #1f1b2e; }
  main { max-width: 560px; margin: 24px; padding: 32px; background: #fff; border-radius: 20px;
         box-shadow: 0 12px 40px rgba(76, 29, 149, .12); text-align: center; }
  img { width: 180px; height: auto; }
  h1 { font-size: 26px; margin: 12px 0 6px; color: #4c1d95; }
  p { line-height: 1.55; color: #4b4660; margin: 8px 0; }
  a.btn { display: inline-block; margin-top: 14px; padding: 10px 20px; border-radius: 999px; background: #7c3aed; color: #fff;
          text-decoration: none; font-weight: 600; }
  a.btn:hover { background: #6d28d9; }
  small { display: block; margin-top: 18px; color: #8b85a0; font-size: 12px; }
  small a { color: #7c3aed; }
  .diag { font-size: 12.5px; color: #8b85a0; margin-top: 14px; }
  .diag code { font-family: ui-monospace, monospace; color: #4c1d95; }
</style>
</head>
<body>
<main>
  <img src="/alea/assets/images/axiomaths/liu-reflechit.png" alt="Liu, la mascotte, réfléchit">
  <h1>AxioMaths s'ouvre depuis DataGrade</h1>
  <p>Les exercices de maths sont réservés aux élèves et aux professeurs de DataGrade.</p>
  <p>Élève : connecte-toi avec ton code et ouvre ta séance depuis la brique <strong>AxioMaths</strong>.
     Prof : passe par le menu <strong>AxioMaths</strong>.</p>
  <a class="btn" id="aller" href="https://datagrade.fr/" target="_top">Aller sur DataGrade</a>
  <p class="diag" id="diag-cadre" hidden>Cette page s'affiche dans DataGrade : le portier a refusé l'accès. Prof administrateur, le bouton « Tester le portier », en bas de la page AxioMaths, en donne la raison.</p>
  <p class="diag">Motif : <?= htmlspecialchars($motif, ENT_QUOTES, 'UTF-8') ?>.<br>Clé publique de DataGrade : <span id="diag-cle"><?= htmlspecialchars($diagCle, ENT_QUOTES, 'UTF-8') ?></span>.</p>
  <small>AxioMaths est propulsé par <a href="https://coopmaths.fr/alea/">MathALÉA</a> (CoopMaths, AGPL-3.0) ·
         <a href="/alea/deploiement.json">sources de cette version</a></small>
</main>
<script>
  // Dans le cadre de DataGrade, « Aller sur DataGrade » n'a pas de sens : on l'explique à la place.
  if (window.top !== window.self) {
    document.getElementById('aller').hidden = true;
    document.getElementById('diag-cadre').hidden = false;
  }
</script>
</body>
</html>
