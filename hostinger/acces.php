<?php
declare(strict_types=1);

/**
 * AxioMaths — portier de maths.datagrade.fr/alea/ (déployé en alea/index.php).
 *
 * L'application MathALÉA est un site statique : ce script est servi à la place
 * de index.html (DirectoryIndex) et décide qui peut l'ouvrir.
 *
 *   - Un jeton `dg=<expiration>.v<signature>` dans l'adresse, émis par DataGrade,
 *     ouvre l'accès et pose un cookie pour la journée.
 *   - Le cookie `axio_acces`, signé par ce site, suffit ensuite : les liens
 *     internes de MathALÉA (nouvel onglet, vue élève…) fonctionnent sans jeton.
 *   - Sans l'un ni l'autre : page d'explication qui renvoie vers DataGrade.
 *
 * Aucune clé n'est partagée entre les deux sites, donc rien n'est à recopier :
 * DataGrade signe ses jetons avec une clé qu'il est seul à connaître, et ce
 * portier lui demande (AXIO_CHECK_URL, HTTPS) si le jeton reçu est bien le sien.
 * La question n'est posée qu'à l'entrée ; ensuite le cookie suffit. Rien d'autre
 * que les fonctions PHP de base et curl n'est nécessaire.
 *
 * L'ancien mode (clé partagée du secret AXIO_GATE_SECRET) reste accepté s'il est
 * configuré. Pour rouvrir le site à tous, le workflow écrit `ouvert` dans
 * alea/acces-config.php (variable de dépôt AXIO_PORTIER=ouvert).
 *
 * Les fichiers (JavaScript, images, annales) restent servis directement : ils
 * sont inutilisables sans cette page.
 */

const AXIO_COOKIE      = 'axio_acces';
const AXIO_COOKIE_TTL  = 12 * 3600; // durée d'une journée de classe
const AXIO_TOKEN_SKEW  = 120;       // tolérance d'horloge sur l'expiration du jeton (ancien mode)
const AXIO_CHECK_URL   = 'https://datagrade.fr/api/axiomaths-acces.php';
const AXIO_LINK_RETRY  = 60;        // délai minimal entre deux essais de liaison pour le diagnostic
const AXIO_LINK_CACHE  = __DIR__ . '/acces-liaison.json';
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
 * Interroge DataGrade (HTTPS, certificat vérifié) sur un jeton ; sans jeton, simple essai de liaison.
 * @return array{reponse:?array, erreur:string} réponse JSON de DataGrade, ou la raison de l'échec
 */
function axio_ask(string $token = ''): array
{
    $url = AXIO_CHECK_URL . ($token !== '' ? '?jeton=' . rawurlencode($token) : '');
    $body = false;
    $erreur = '';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 5,
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
        $body = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 8, 'user_agent' => 'AxioMaths-portier']]));
        if ($body === false) $erreur = 'connexion impossible';
    }
    if ($body === false) return ['reponse' => null, 'erreur' => $erreur];
    $json = json_decode((string) $body, true);
    if (!is_array($json) || ($json['service'] ?? '') !== 'axiomaths' || !array_key_exists('ok', $json)) {
        return ['reponse' => null, 'erreur' => 'réponse inattendue de DataGrade'];
    }
    return ['reponse' => $json, 'erreur' => ''];
}

/**
 * Demande à DataGrade si le jeton `<expiration>.v<signature>` est bien le sien.
 * @return array{0:string, 1:string} motif ('' si le jeton est valide, sinon 'format', 'expire',
 *         'signature' ou 'liaison') et détail de l'échec de liaison éventuel
 */
function axio_check_remote(string $value): array
{
    if (!preg_match('/^(\d{9,12})\.v([0-9a-f]{40})$/', $value, $m)) return ['format', ''];
    if ((int) $m[1] + AXIO_TOKEN_SKEW < time()) return ['expire', '']; // inutile de déranger DataGrade
    $r = axio_ask($value);
    if ($r['reponse'] === null) return ['liaison', $r['erreur']];
    if ($r['reponse']['ok'] === true) return ['', ''];
    $motif = (string) ($r['reponse']['motif'] ?? '');
    return [in_array($motif, ['format', 'expire', 'signature'], true) ? $motif : 'signature', ''];
}

/**
 * État de la liaison avec DataGrade, pour le diagnostic de la page de refus
 * (au plus un essai par minute, quel que soit le nombre de visiteurs).
 */
function axio_link_state(): string
{
    $cache = json_decode((string) @file_get_contents(AXIO_LINK_CACHE), true);
    if (is_array($cache) && time() - (int) ($cache['lue'] ?? 0) < AXIO_LINK_RETRY && is_string($cache['etat'] ?? null)) {
        return $cache['etat'];
    }
    $r = axio_ask();
    $etat = $r['reponse'] !== null ? 'établie' : 'en échec (' . $r['erreur'] . ')';
    axio_write(AXIO_LINK_CACHE, json_encode(['etat' => $etat, 'lue' => time()]));
    return $etat;
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

// Le cookie d'abord : un visiteur déjà entré ne redemande rien à DataGrade.
$cookieKey = axio_cookie_key($secret);
$cookie = (string) ($_COOKIE[AXIO_COOKIE] ?? '');
if ($cookie !== '' && $cookieKey !== null && axio_check($cookieKey, 'cookie', $cookie) === '') axio_serve_app();

$token = (string) ($_GET['dg'] ?? '');
$detail = '';
if ($token === '') {
    $tokenProblem = 'absent';
} elseif ($secret !== '' && preg_match('/^\d{9,12}\.[0-9a-f]{32}$/', $token)) {
    $tokenProblem = axio_check($secret, 'acces', $token, AXIO_TOKEN_SKEW); // ancien mode, clé partagée
} else {
    [$tokenProblem, $detail] = axio_check_remote($token);
}
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

// Refus : explication et retour vers DataGrade. Le motif et l'état de la liaison
// aident à comprendre un refus qui apparaîtrait DANS DataGrade ; ils ne révèlent
// rien de secret.
$motifs = [
    'absent'    => 'aucun jeton reçu : le lien ne vient pas de DataGrade, ou DataGrade n\'est pas à jour',
    'format'    => 'jeton illisible : DataGrade n\'est pas à jour',
    'signature' => 'jeton non reconnu par DataGrade',
    'expire'    => 'jeton expiré : recharge la page DataGrade',
    'liaison'   => 'DataGrade n\'a pas pu être interrogé',
];
$motif = $motifs[$tokenProblem] ?? $tokenProblem;
$liaison = $tokenProblem === 'liaison' ? 'en échec (' . $detail . ')' : axio_link_state();
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
  <p class="diag">Motif : <?= htmlspecialchars($motif, ENT_QUOTES, 'UTF-8') ?>.<br>Liaison avec DataGrade : <span id="diag-liaison"><?= htmlspecialchars($liaison, ENT_QUOTES, 'UTF-8') ?></span>.</p>
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
