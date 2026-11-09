const scorm = window.pipwerks.SCORM

/*
  Encodage des réponses (voir src/lib/lms/answersCodec.ts, dont ceci est le pendant :
  ce script est servi tel quel au SCO Moodle et ne peut pas importer de module).

  SCORM 1.2 limite cmi.suspend_data à 4096 caractères et student_response à 255 :
  une seule figure ApiGeom suffisait à les dépasser. Les réponses sont donc
  compressées en gzip puis encodées en base64url, ce qui les rend transportables
  telles quelles dans une URL, sans échappement %xx.

  Le préfixe 'z:' permet de distinguer ce format du JSON brut, de sorte que les
  copies enregistrées avant la compression restent lisibles.
*/
const COMPRESSED_PREFIX = 'z:'

async function encodeAnswers(answers) {
  const json = JSON.stringify(answers)
  if (typeof CompressionStream !== 'function') return json
  const bytes = new TextEncoder().encode(json)
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  const gzipped = new Uint8Array(await new Response(stream).arrayBuffer())
  let binary = ''
  for (const byte of gzipped) binary += String.fromCharCode(byte)
  const base64url = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return COMPRESSED_PREFIX + base64url
}

/* Le base64url passe tel quel dans une URL ; le JSON brut du repli doit être échappé. */
function answersForUrl(encodedAnswers) {
  return encodedAnswers.startsWith(COMPRESSED_PREFIX)
    ? encodedAnswers
    : encodeURIComponent(encodedAnswers)
}

/*
  Format de cmi.suspend_data : `graine[;d=durée]|réponses`.

  - L'élève n'a jamais accédé à l'exercice : ''
  - Il y a accédé sans répondre : `graine`
  - Il a répondu : `graine|réponses`
  - Il a répondu à une Course aux nombres (chronométrée) : `graine;d=durée|réponses`

  La durée (en secondes) est placée avant le premier `|` car les réponses, quand
  le repli JSON brut est utilisé, peuvent elles-mêmes contenir ce caractère
  (`\left|` par exemple). Les graines, elles, ne contiennent jamais de `;`.
*/
function parseSuspendData(suspendData) {
  if (!suspendData) return { seed: undefined, answers: '', duration: '' }
  const separatorIndex = suspendData.indexOf('|')
  const seedPart =
    separatorIndex === -1 ? suspendData : suspendData.slice(0, separatorIndex)
  const answers =
    separatorIndex === -1 ? '' : suspendData.slice(separatorIndex + 1)
  const [seed, ...seedExtras] = seedPart.split(';')
  const durationExtra = seedExtras.find((extra) => extra.startsWith('d=')) || ''
  return { seed, answers, duration: durationExtra.slice(2) }
}

function buildSuspendData(seed, encodedAnswers, duration) {
  const seedPart = Number.isFinite(duration) ? seed + ';d=' + duration : seed
  return seedPart + '|' + encodedAnswers
}

/*
  Graine de l'élève quand l'export SCORM d'une Course aux nombres donne à chaque
  exercice une graine suffixée de son rang (`alea=-1-rang`) : c'est elle, et non
  celle du premier exercice, qui doit être enregistrée avec les réponses. Les
  autres SCO gardent la graine renvoyée par MathALÉA.
*/
let studentSeed

window.onload = function () {
  const style = document.createElement('style')
  style.innerHTML =
    'body, html { margin: 0px; padding: 0px; height: 100%; overflow: auto; }'
  document.head.appendChild(style)
  const chargement = document.createElement('div')
  chargement.innerHTML = 'Chargement en cours...'
  document.body.appendChild(chargement)
  scorm.init()
  let exo = location.hash.slice(1)
  const iframe = document.createElement('iframe')
  const suspendData = scorm.get('cmi.suspend_data')
  const { seed: storedSeed, answers, duration } = parseSuspendData(suspendData)
  let seed = storedSeed
  const randomSeed = exo.includes('&alea=-1') || !exo.includes('&alea')
  // Il faut générer une graine si alea n'est pas fourni ou est égal à -1
  if (randomSeed) {
    // La graine n'est pas fourni, il faut la générer si ce n'est pas déjà fait
    if (!seed) {
      seed = Math.floor(Math.random() * 100000)
      // On sauvegarde immédiatement la graine pour éviter la triche
      scorm.set('cmi.suspend_data', seed)
    }
    if (/&alea=-1-\d/.test(exo)) studentSeed = seed
    // Il faut remplacer tous les alea aux cas où on est dans une CAN
    if (exo.includes('&alea=-1')) {
      exo = exo.replaceAll('&alea=-1', '&alea=' + seed)
    } else {
      exo = exo.replaceAll(
        /((?:^|&)uuid=[^&]+(?:&id=[^&]+)?)/g,
        '$1&alea=' + seed,
      )
    }
  }
  let src = 'https://coopmaths.fr/alea/?'
  src += exo
  if (!exo.includes('&v=can')) {
    src += '&i=1&v=eleve&title='
    // Réglages de la vue élève par défaut, sauf si l'export SCORM les fixe (titre masqué…)
    if (!/(^|&)es=/.test(exo)) src += '&es=011010'
  }
  src += '&recorder=moodle'
  if (answers !== '') {
    src += '&done=1&answers=' + answers
    // La CAN affiche aussi le temps mis par l'élève, que le chronomètre ne peut
    // plus fournir puisque la course n'est pas rejouée.
    if (duration !== '') {
      src += '&duration=' + duration
    }
  }
  iframe.src = src
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  // Autorise le plein écran natif quand Moodle l'autorise lui-même pour l'iframe du SCO
  iframe.setAttribute('allow', 'fullscreen')
  iframe.style.display = 'none'
  iframe.onload = function () {
    chargement.style.display = 'none'
    iframe.style.display = 'block'
  }
  document.body.appendChild(iframe)

  try {
    // Pour éviter que les élèves ne se rendent pas compte qu'il y a plusieurs exercices, on déplie le menu si besoin
    const boutonSommaire = window.parent.document.getElementById(
      'scorm_toc_toggle_btn',
    )
    const sommaireCache = window.parent.document
      .getElementById('scorm_toc')
      .classList.contains('disabled')
    const multiplesExos =
      window.parent.document
        .getElementById('scorm_tree')
        .getElementsByTagName('li').length > 1
    if (sommaireCache && multiplesExos) {
      boutonSommaire.click()
    }
  } catch (e) {}
}

window.addEventListener('pagehide', function (event) {
  scorm.quit()
})

/*
  Repli du plein écran demandé par MathALÉA (message `mathalea:fullscreen`, voir
  src/lib/fullscreen.ts). Moodle pose l'iframe du SCO sans `allowfullscreen` :
  l'API Fullscreen native est donc refusée à MathALÉA, qui est imbriquée dedans.

  Le SCO étant servi depuis le domaine de Moodle, il peut en revanche agrandir
  sa propre iframe pour couvrir la page du cours. Le style d'origine est
  mémorisé car Moodle y écrit la hauteur du lecteur SCORM.
*/
let scoFrameStyle = null

function setPseudoFullscreen(isFullscreen) {
  let frame
  try {
    frame = window.frameElement // null si le SCO est ouvert dans sa propre fenêtre
  } catch {
    frame = null
  }
  if (!frame) return
  if (isFullscreen) {
    if (scoFrameStyle === null)
      scoFrameStyle = frame.getAttribute('style') || ''
    frame.setAttribute(
      'style',
      scoFrameStyle +
        ';box-sizing:border-box;position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;background:#fff;',
    )
    frame.ownerDocument.body.style.overflow = 'hidden'
  } else {
    frame.setAttribute('style', scoFrameStyle || '')
    scoFrameStyle = null
    frame.ownerDocument.body.style.overflow = ''
  }
}

window.addEventListener('message', async (event) => {
  if (
    typeof event.data.action !== 'undefined' &&
    event.data.action.startsWith('mathalea:')
  ) {
    if (event.data.action === 'mathalea:fullscreen') {
      setPseudoFullscreen(event.data.value === true)
    }
    if (event.data.action === 'mathalea:score') {
      const seed = studentSeed ?? event.data.resultsByExercice[0].alea
      let points = 0
      let max = 0
      for (let result of event.data.resultsByExercice) {
        points += result.numberOfPoints
        max += result.numberOfQuestions
      }
      const scoreMax =
        Math.ceil(
          10000 /
            (window?.parent?.document
              ?.getElementById('scorm_tree')
              ?.getElementsByTagName('li')?.length || 1),
        ) / 100
      const score = Math.round(100 * (points / max) * scoreMax) / 100
      scorm.status('set', 'completed')
      scorm.set('cmi.core.score.raw', score)
      scorm.set('cmi.core.score.min', '0')
      scorm.set('cmi.core.score.max', scoreMax.toString())
      /*
        En vue élève resultsByExercice contient un exercice, en vue CAN une entrée
        par question : on fusionne les réponses de toutes les entrées pour que la
        copie rechargée soit complète (les clés `ExiQj` sont uniques).
      */
      const allAnswers = Object.assign(
        {},
        ...event.data.resultsByExercice.map((result) => result.answers || {}),
      )
      const encodedAnswers = await encodeAnswers(allAnswers)
      const duration = event.data.duration
      scorm.set(
        'cmi.suspend_data',
        buildSuspendData(seed, encodedAnswers, duration),
      )
      let copieEleveUrl = document.getElementsByTagName('iframe')[0].src
      if (studentSeed === undefined) {
        copieEleveUrl = copieEleveUrl.replace(/&alea=[^&]+/, '&alea=' + seed) // On remplace la seed au cas où qu'elle ait changé
      }
      copieEleveUrl += '&done=1&answers=' + answersForUrl(encodedAnswers)
      if (Number.isFinite(duration)) {
        copieEleveUrl += '&duration=' + duration
      }
      scorm.set('cmi.interactions_0.student_response', copieEleveUrl)
      // scorm.set("cmi.success_status", "passed");
      scorm.save()
    }
  }
})
