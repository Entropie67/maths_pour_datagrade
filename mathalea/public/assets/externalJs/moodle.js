import 'https://cdn.jsdelivr.net/npm/mathlive/+esm'
window.mathVirtualKeyboard.targetOrigin = '*'
if (typeof window.iMathAlea === 'undefined') {
  // Normalement ce script ne devrait être chargé qu'une unique fois car appelé en module
  // On vérifie tout de même au cas où que le fichier ne soit pas appelé en module
  // Ou que l'on appelle des fichiers depuis des serveurs différents
  // Remarque dans ce dernier cas : tout les exos seront chargés depuis le premier serveur
  window.iMathAlea = []

  let DEBUG = false

  if (location.hash.startsWith('#DEBUG=')) {
    const DEBUGURL = new URL('.', location.hash.substring(7))
    try {
      if (
        DEBUGURL.hostname !== 'localhost' &&
        DEBUGURL.hostname !== '127.0.0.1'
      ) {
        throw new Error('Le serveur doit être en localhost ou 127.0.0.1')
      }
      DEBUG = DEBUGURL.href
    } catch (e) {
      console.error(e)
    }
  }

  /*
    Encodage des réponses (voir src/lib/lms/answersCodec.ts, dont ceci est le
    pendant : ce script est servi tel quel à Moodle et ne peut pas importer de
    module).

    Les réponses sont compressées en gzip puis encodées en base64url, ce qui les
    rend transportables telles quelles dans une URL. C'est indispensable en vue
    Course aux nombres, où la copie contient les réponses de toutes les questions
    de la course.

    Le préfixe 'z:' permet de distinguer ce format du JSON brut, de sorte que les
    copies enregistrées avant la compression restent lisibles.
  */
  const COMPRESSED_PREFIX = 'z:'

  const encodeAnswers = async (answers) => {
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

  /*
    Une entrée de `resultsByExercice` par exercice en vue élève, une par question
    en vue Course aux nombres : le score est la somme des points sur la somme des
    questions, et les réponses sont fusionnées (les clés `ExiQj` sont uniques).
  */
  const totalScoreInPercent = (resultsByExercice) => {
    let points = 0
    let questions = 0
    for (const result of resultsByExercice) {
      points += result.numberOfPoints
      questions += result.numberOfQuestions
    }
    return questions === 0 ? 0 : (points / questions) * 100
  }

  const mergeAnswers = (resultsByExercice) =>
    Object.assign(
      {},
      ...resultsByExercice.map((result) => result.answers || {}),
    )

  /*
    La réponse enregistrée dans Moodle a la forme `score[|métadonnées]|réponses`.

    Le score doit rester seul devant le premier `|` : c'est lui qui est comparé
    aux réponses `=%x%score|*` de la question GIFT, donc à la note obtenue.

    Le segment de métadonnées, `graine[;d=durée]`, n'est présent que lorsque
    l'exercice est en graine aléatoire ou en vue Course aux nombres (qui doit
    mémoriser le temps mis par l'élève, que le chronomètre ne peut plus fournir
    lors de la relecture). Sa présence se déduit donc des attributs de l'élément,
    et non du contenu de la valeur enregistrée.
  */
  const hasMetaData = (element) =>
    element.getAttribute('graine') === '-1' || element.hasAttribute('can')

  const buildMetaData = (element, duration) => {
    const seed = element.getAttribute('graine') === '-1' ? element.aleaSeed : ''
    return Number.isFinite(duration) ? seed + ';d=' + duration : seed
  }

  /*
    Repli du plein écran demandé par MathALÉA (message `mathalea:fullscreen`,
    voir src/lib/fullscreen.ts) : l'API Fullscreen native est normalement
    autorisée ici (l'iframe est créée avec allow="fullscreen"), mais si le
    navigateur ou la politique de la page la refuse, l'élément <mathalea-moodle>
    est agrandi aux dimensions de la fenêtre de Moodle.
  */
  const setPseudoFullscreen = (element, isFullscreen) => {
    if (isFullscreen) {
      /*
        Pendant le plein écran, les messages de redimensionnement continuent de
        poser sur l'élément la hauteur de la fenêtre : on mémorise la hauteur de
        l'exercice pour la lui rendre à la sortie.
      */
      element.hauteurAvantPleinEcran = element.getAttribute('height')
      element.setAttribute(
        'style',
        'display:block;box-sizing:border-box;position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;background:#fff;',
      )
      // Le style est prioritaire sur l'attribut height
      element.iframe.style.height = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      element.removeAttribute('style')
      element.iframe.style.height = ''
      document.body.style.overflow = ''
      if (element.hauteurAvantPleinEcran) {
        element.setAttribute('height', element.hauteurAvantPleinEcran)
      }
    }
  }

  window.addEventListener('message', async (event) => {
    // V3 ou V4
    if (
      typeof event.data.action !== 'undefined' &&
      event.data.action.startsWith('mathalea:')
    ) {
      if (
        typeof event.data.iframe !== 'undefined' &&
        typeof window.iMathAlea[parseInt(event.data.iframe)] !== 'undefined'
      ) {
        const iframe = window.iMathAlea[parseInt(event.data.iframe)].iframe
        const question = window.iMathAlea[parseInt(event.data.iframe)].question
        if (
          (event.data.action === 'mathalea:init' ||
            event.data.action === 'mathalea:resize') &&
          typeof event.data.hauteurExercice !== 'undefined'
        ) {
          const hauteur = event.data.hauteurExercice
          // hauteur += 50
          iframe.setAttribute('height', hauteur.toString())
        }
        if (event.data.action === 'mathalea:fullscreen') {
          setPseudoFullscreen(iframe, event.data.value === true)
        }
        if (event.data.action === 'mathalea:score') {
          const score = totalScoreInPercent(event.data.resultsByExercice)
          // On regarde le score le plus proche parmi les scores compatibles moodle
          let compatibleScore
          if (iframe.getAttribute('v')) {
            // v4
            compatibleScore = [
              100, 90, 83.333, 80, 75, 66.666, 60, 50, 40, 33.333, 30, 25, 20,
              16.666, 14.2857, 12.5, 11.111, 10, 5, 0,
            ]
          } else {
            // v3
            compatibleScore = [
              100, 90, 80, 75, 66.666, 60, 50, 40, 33.333, 30, 25, 20, 16.666,
              14.2857, 12.5, 11.111, 10, 5, 0,
            ]
          }
          const moodleScore = compatibleScore.reduce((prev, curr) => {
            return Math.abs(curr - score) < Math.abs(prev - score) ? curr : prev
          })
          const encodedAnswers = await encodeAnswers(
            mergeAnswers(event.data.resultsByExercice),
          )
          const parts = [moodleScore]
          if (hasMetaData(iframe)) {
            // Graine tirée au sort et/ou durée de la course : il faut les
            // enregistrer avec le score pour pouvoir rejouer la copie.
            parts.push(buildMetaData(iframe, event.data.duration))
          }
          parts.push(encodedAnswers)
          question.querySelector('[name$="_answer"]').value = parts.join('|')
          question.querySelector('[name$="_-submit"]')?.click()
        }
      }
    }
    // V2
    if (
      typeof event.data.iMoodle === 'number' &&
      typeof window.iMathAlea[event.data.iMoodle] !== 'undefined'
    ) {
      const iframe = window.iMathAlea[event.data.iMoodle].iframe
      const question = window.iMathAlea[event.data.iMoodle].question
      let hauteur =
        event.data.hauteurExercice || event.data.hauteurExerciceCorrection
      if (typeof hauteur !== 'undefined') {
        hauteur += 50
        iframe.setAttribute('height', hauteur.toString())
      }
      if (typeof event.data.score !== 'undefined') {
        question.querySelector('[name$="_answer"]').value =
          event.data.score + '|' + JSON.stringify(event.data.reponses)
        question.querySelector('[name$="_-submit"]')?.click()
      }
    }
  })

  const style = document.createElement('style')
  style.innerHTML =
    '.mathalea-question-type .form-inline, .mathalea-question-type .im-controls, .mathalea-question-type .rightanswer, .mathalea-question-type .ablock { display: none !important; }'
  document.head.appendChild(style)

  // Create a class for the element
  class MathALeaMoodle extends HTMLElement {
    /*
    // Appelé lors de la création de l'élément
    constructor () {
      // Always call super first in constructor
      super()
    }
    */

    // Appelé lorsque l'élément est inséré dans le DOM
    connectedCallback() {
      let VERSION
      /*
        Il y a actuellement plusieurs versions :
        - 4
        - 3
        - 2
        La version 2 n'est pas explicitement définie. Elle se base sur l'ancien format du site et n'a pas d'attribut url.
        La version 3 n'est pas explicitement définie. Elle se base sur la nouvelle version du site et a un attribut url.
        Les versions 4 ou plus sont explicitement définies par un attribut v.
      */
      if (this.getAttribute('url')) {
        VERSION = Number(this.getAttribute('v') ?? 3)
      } else {
        VERSION = 2
      }

      // Si l'attribut serveur est défini, on l'utilise (url non vérifiée / sécurisée)
      // Sinon on utilise l'url du script actuel récupérée soit via
      // document.currentScript si le fichier n'est pas appelé en mode module
      // import.meta.url si le fichier appelé en mode module
      let SERVEUR_URL
      try {
        if (DEBUG) {
          SERVEUR_URL = new URL(DEBUG)
        } else {
          SERVEUR_URL = new URL(
            '../..',
            this.getAttribute('serveur') ||
              document.currentScript?.src ||
              import.meta.url,
          ) // ou origin + pathname
        }
        if (
          SERVEUR_URL.protocol !== 'http:' &&
          SERVEUR_URL.protocol !== 'https:'
        ) {
          throw new Error('Le serveur doit avoir un protocol en http ou https')
        }
        SERVEUR_URL = SERVEUR_URL.href
      } catch (e) {
        SERVEUR_URL = 'data:text,' + e
      }

      const shadow = this.attachShadow({ mode: 'open' }) // this.shadowRoot

      const iMoodle = window.iMathAlea.length
      let questionSeed = ''

      let questionDiv = this.parentNode
      // On remonte de parent en parent depuis la balise script jusqu'à trouver le div avec le numero de la question en id
      while (questionDiv !== null) {
        // s'arrêtera lorsqu'il n'y aura plus de parents
        if (
          typeof questionDiv.id === 'string' &&
          questionDiv.id.startsWith('question-')
        ) {
          questionSeed = this.getAttribute('graine') || questionDiv.id
          break // la seed a été trouvée
        }
        questionDiv = questionDiv.parentNode
      }
      if (questionSeed === '-1') {
        questionSeed = Math.random().toString(36).substring(2, 15)
        this.aleaSeed = questionSeed
      }
      if (questionDiv === null) {
        // début compatibilité moodle 3.5
        questionDiv = this.parentNode
        while (questionDiv !== null) {
          // s'arrêtera lorsqu'il n'y aura plus de parents
          if (questionDiv.classList.contains('shortanswer')) {
            questionSeed =
              this.getAttribute('graine') ||
              questionDiv
                .querySelector('input[name$=":sequencecheck"]')
                .getAttribute('name')
            break // la seed a été trouvée
          }
          questionDiv = questionDiv.parentNode
        }
        // fin compatibilité moodle 3.5

        if (questionDiv === null) {
          shadow.appendChild(
            document.createTextNode(
              "[Erreur de détection de la l'environnement moodle]",
            ),
          )
          return
        }
      }

      questionDiv.classList.add('mathalea-question-type')

      let answer
      let duration = ''
      const isCan = this.hasAttribute('can')
      const addIframe = () => {
        iframe.setAttribute('width', '100%')
        /*
          La Course aux nombres occupe toute la hauteur de la fenêtre : dans un
          cadre de la hauteur d'un exercice, elle serait illisible. Le bouton
          plein écran reste à la disposition de l'élève.
        */
        iframe.setAttribute('height', isCan ? '600' : '400')
        if (VERSION >= 3) {
          let exoUrl = this.getAttribute('url')
          const ES =
            this.getAttribute('titre') === 'false' ? '01101000' : '01101011'
          /*
            uuid=XXX&id=XXX&cols=2 => uuid=XXX&id=XXX[&alea=XX]&cols=2
            uuid=XXX&id=XXX => uuid=XXX&id=XXX[&alea=XX]

            Une Course aux nombres réunit plusieurs exercices dans une seule
            question Moodle : chacun reçoit la graine suffixée de son rang, sans
            quoi deux exercices identiques poseraient la même question.
          */
          if (!/(^|&)alea=/.test(exoUrl)) {
            // Sans graine imposée par l'enseignant, on ajoute celle de la question
            let exoIndex = 0
            exoUrl = exoUrl.replaceAll(
              /(uuid=[A-Za-z0-9]+(?:&id=[A-Za-z0-9-]+)?)(&|$)/g,
              (match, params, separator) =>
                params +
                '&alea=' +
                questionSeed +
                (isCan ? '-' + exoIndex++ : '') +
                separator,
            )
          }
          iframe.setAttribute(
            'src',
            SERVEUR_URL +
              '?' +
              exoUrl +
              (isCan
                ? '&v=can&recorder=moodle'
                : '&i=1&v=eleve&recorder=moodle&title=&es=' + ES) +
              '&iframe=' +
              iMoodle +
              (this.getAttribute('correction') !== null ? '&done=1' : '') +
              (typeof answer !== 'undefined' ? '&answers=' + answer : '') +
              (duration !== '' ? '&duration=' + duration : ''),
          )
        } else {
          // 4A11-0,s\=3,s2\=true,s3\=false,s4\=false,n\=4,video\=0,cc\=1,cd\=1
          // => (les slashs ne sont que dans le gift)
          // id\=4A11-0&s\=3&s2\=true&s3\=false&s4\=false&n\=4&cd\=1
          const exoParams = this.getAttribute('ex').split(',')
          exoParams[0] = 'id=' + exoParams[0]
          exoParams.push('alea=' + questionSeed)
          const exoUrl = exoParams.join('&')
          iframe.setAttribute(
            'src',
            SERVEUR_URL +
              '?' +
              exoUrl +
              '&i=1&v=eleve&recorder=moodle&title=&es=011010&iframe=' +
              iMoodle +
              (this.getAttribute('correction') !== null ? '&done=1' : '') +
              (typeof answer !== 'undefined' ? '&answers=' + answer : ''),
          )
          // iframe.setAttribute('src', SERVEUR_URL + '/mathalea.html?ex=' + this.getAttribute('ex') + ',i=1&v=' + (this.getAttribute('correction') === null ? 'exMoodle' : 'correctionMoodle') + '&z=1&iMoodle=' + iMoodle + '&serie=' + questionSeed + (typeof answer !== 'undefined' ? '&moodleJson=' + answer : ''))
        }
        iframe.setAttribute('frameBorder', '0')
        iframe.setAttribute('allow', 'fullscreen')
        shadow.appendChild(iframe)
      }

      const iframe = document.createElement('iframe')
      this.iframe = iframe
      window.iMathAlea.push({ iframe: this, question: questionDiv })

      if (questionDiv.classList.contains('notyetanswered')) {
        // L'élève n'a pas encore répondu à la question, on affiche immédiatement l'iframe
        addIframe()
      } else {
        // L'élève a répondu, on attend que la page charge pour récupérer ses réponses
        document.addEventListener('DOMContentLoaded', () => {
          // facultatif si le fichier est importé en mode module car l'exécution du script est deferred
          if (VERSION >= 3) {
            if (questionDiv.querySelector('.outcome')) {
              // En v3 la correction est mélangée à l'énoncé. On masque la question (qui contient l'énoncé)
              // pour ne garder que la réponse (qui contient l'énoncé et la correction).
              questionDiv.querySelector('.formulation ').style.display = 'none'
            } else {
              // L'élève a déjà répondu à la question mais est encore en train de passer le test
              // Il ne s'agit donc pas d'un affichage de la corrrection.
              iframe.style.pointerEvents = 'none'
              iframe.style.filter = 'blur(5px)'
              iframe.style.userSelect = 'none'
              const successMessage = document.createElement('div')
              successMessage.textContent =
                'Vous avez déjà effectué cet exercice'
              successMessage.setAttribute(
                'style',
                'position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);background-color: lightgreen;padding: 10px;border: 1px solid green;color: green;z-index:1;',
              )
              shadow.appendChild(iframe)
              shadow.appendChild(successMessage)
            }
          }
          // Réponse enregistrée : `score[|graine[;d=durée]]|réponses`
          answer = questionDiv.querySelector('[name$="_answer"]').value
          answer = answer.slice(answer.indexOf('|') + 1)
          if (hasMetaData(this)) {
            const metaData = answer.slice(0, answer.indexOf('|'))
            answer = answer.slice(answer.indexOf('|') + 1)
            const [seed, ...extras] = metaData.split(';')
            if (this.getAttribute('graine') === '-1') {
              // On est en mode aléatoire, il faut récupérer la graine présente avec la réponse
              questionSeed = seed
            }
            // La Course aux nombres affiche aussi le temps mis par l'élève, que
            // le chronomètre ne peut plus fournir puisqu'elle n'est pas rejouée.
            duration = (
              extras.find((extra) => extra.startsWith('d=')) ?? ''
            ).slice(2)
          }
          answer = encodeURIComponent(answer)
          addIframe()
        })
      }

      shadow.appendChild(iframe)
    }

    attributeChangedCallback(name, oldValue, newValue) {
      name === 'height' && (this.iframe.height = newValue)
    }

    static get observedAttributes() {
      return ['height']
    }
  }

  // Define the new element
  customElements.define('mathalea-moodle', MathALeaMoodle)
}
