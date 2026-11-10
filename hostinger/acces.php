<?php
declare(strict_types=1);

/**
 * AxioMaths — portier de maths.datagrade.fr/alea/ (déployé en alea/index.php).
 *
 * L'application MathALÉA est un site statique : ce script est servi à la place
 * de index.html (DirectoryIndex) et décide qui peut l'ouvrir.
 *
 *   - Un jeton `dg=<expiration>.<signature>` dans l'adresse, signé par DataGrade
 *     avec la clé partagée, ouvre l'accès et pose un cookie pour la journée.
 *   - Le cookie `axio_acces`, lui aussi signé, suffit ensuite : les liens
 *     internes de MathALÉA (nouvel onglet, vue élève…) fonctionnent sans jeton.
 *   - Sans l'un ni l'autre : page d'explication qui renvoie vers DataGrade.
 *
 * La clé vient de alea/acces-config.php, écrit par le workflow de déploiement
 * depuis le secret AXIO_GATE_SECRET. Sans clé configurée, le portier laisse
 * tout le monde passer (site public, comme avant).
 *
 * Les fichiers (JavaScript, images, annales) restent servis directement : ils
 * sont inutilisables sans cette page.
 */

const AXIO_COOKIE      = 'axio_acces';
const AXIO_COOKIE_TTL  = 12 * 3600; // durée d'une journée de classe
const AXIO_TOKEN_SKEW  = 120;       // tolérance d'horloge sur l'expiration du jeton

$config = @include __DIR__ . '/acces-config.php';
$secret = is_array($config) ? trim((string) ($config['secret'] ?? '')) : '';

function axio_sign(string $secret, string $purpose, string $expires): string
{
    return substr(hash_hmac('sha256', $purpose . '|' . $expires, $secret), 0, 32);
}

/**
 * Vérifie une valeur `<expiration>.<signature>` pour un usage donné.
 * @return string '' si elle est valide, sinon le motif du refus : 'format', 'expire' ou 'signature'
 */
function axio_check(string $secret, string $purpose, string $value, int $skew = 0): string
{
    if (!preg_match('/^(\d{9,12})\.([0-9a-f]{32})$/', $value, $m)) return 'format';
    if (!hash_equals(axio_sign($secret, $purpose, $m[1]), $m[2])) return 'signature';
    if ((int) $m[1] + $skew < time()) return 'expire';
    return '';
}

/**
 * Empreinte publique de la clé (six caractères) : permet de comparer la clé du
 * site et celle de DataGrade sans jamais afficher ni l'une ni l'autre.
 */
function axio_fingerprint(string $secret): string
{
    return substr(hash('sha256', 'axiomaths-empreinte|' . $secret), 0, 6);
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

// Portier désactivé tant qu'aucune clé n'est configurée.
if ($secret === '') axio_serve_app();

$token = (string) ($_GET['dg'] ?? '');
$tokenProblem = $token === '' ? 'absent' : axio_check($secret, 'acces', $token, AXIO_TOKEN_SKEW);
if ($tokenProblem === '') {
    $expires = (string) (time() + AXIO_COOKIE_TTL);
    setcookie(AXIO_COOKIE, $expires . '.' . axio_sign($secret, 'cookie', $expires), [
        'expires'  => (int) $expires,
        'path'     => '/alea/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax', // datagrade.fr et maths.datagrade.fr sont le même site : l'iframe est autorisée
    ]);
    axio_serve_app();
}

$cookie = (string) ($_COOKIE[AXIO_COOKIE] ?? '');
if ($cookie !== '' && axio_check($secret, 'cookie', $cookie) === '') axio_serve_app();

// Refus : explication et retour vers DataGrade. Le motif aide à régler le
// portier quand la page apparaît DANS DataGrade (clé non enregistrée, clés
// différentes) ; il ne révèle rien de la clé.
$motifs = [
    'absent'    => 'aucun jeton reçu : DataGrade n\'a pas de clé du portier enregistrée, ou le lien ne vient pas de DataGrade',
    'format'    => 'jeton illisible',
    'signature' => 'jeton signé avec une autre clé : la clé enregistrée dans DataGrade et celle du site sont différentes',
    'expire'    => 'jeton expiré : recharge la page DataGrade',
];
$motif = $motifs[$tokenProblem] ?? $tokenProblem;
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
  <p class="diag" id="diag-cadre" hidden>Cette page s'affiche dans DataGrade : le portier a refusé l'accès. Prof administrateur, vérifie la clé du portier en bas de la page AxioMaths (bouton « Tester le portier »).</p>
  <p class="diag">Motif : <?= htmlspecialchars($motif, ENT_QUOTES, 'UTF-8') ?>.<br>Empreinte de la clé du site : <code><?= axio_fingerprint($secret) ?></code></p>
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
