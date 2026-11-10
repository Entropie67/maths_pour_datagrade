<script lang="ts">
  import {
    mathaleaGetExercicesFromParams,
    mathaleaUpdateExercicesParamsFromUrl,
  } from '../../../lib/mathalea.js'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import {
    isIExercice,
    type IExercice,
    type IExerciceStatique,
  } from '../../../lib/types'
  import Footer from '../../Footer.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'

  type TypeNote = {
    deckName: string
    modelName: string
    fields: {
      Titre: string
      url: string
    }
    options?: {
      allowDuplicate?: boolean
    }
  }
  const notes: TypeNote[] = []
  let exercices: (IExercice | IExerciceStatique)[] = []

  let chargement = true

  async function initExercices() {
    mathaleaUpdateExercicesParamsFromUrl()
    exercices = await mathaleaGetExercicesFromParams($exercicesParams)
    let i = 0
    for (const param of $exercicesParams) {
      let paramUrl = ''
      for (const key of Object.keys(param)) {
        if (key === 'sup') {
          paramUrl += `s=${param[key]}&`
        } else if (key === 'sup2') {
          paramUrl += `s2=${param[key]}&`
        } else if (key === 'sup3') {
          paramUrl += `s3=${param[key]}&`
        } else if (key === 'nbQuestions') {
          paramUrl += `n=${param[key]}&`
        } else if (key === 'versionQcm') {
          paramUrl += `qcm\\=${param[key]}&`
        } else if (key !== 'alea' && key !== 'id') {
          paramUrl += `${key}=${param[key]}&`
        }
      }
      paramUrl = paramUrl.slice(0, -1)
      const exercice = exercices[i]
      const titre = isIExercice(exercice)
        ? exercice.titre
        : (param.id ?? param.uuid)

      notes.push({
        deckName: 'MathALÉA',
        modelName: 'MathALEA',
        fields: {
          Titre: titre,
          url: 'https://coopmaths.fr/alea/?' + paramUrl,
        },
      })
      i++
    }
    chargement = false
  }

  initExercices()

  let logs = ''

  const ANKI_API_URL = new URL('http://127.0.0.1:8765')
  // hostname // port

  function ankiConnect(action: string, params = {}) {
    console.info('ankiConnect:', action, '...')
    return fetch(ANKI_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action,
        version: 6,
        params,
      }),
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.error) {
          throw new Error(r.error)
        }
        console.info('ankiConnect:', action, '... réussi !')
        return r.result
      })
      .catch((e) => {
        console.error('ankiConnect:', action, '... échoué !')
        throw e
      })
  }

  function importer() {
    logs = ''

    ankiConnect('requestPermission')
      .then((r) => {
        if (r.permission === 'granted') {
          return ankiConnect('modelNames')
        } else {
          throw new Error('Permission not granted')
        }
      })
      .then((r) => {
        logs += 'Connexion à Anki réussie\n'
        if (!r.includes('MathALEA')) {
          logs += 'Création du model MathALEA\n'
          return ankiConnect('createModel', {
            modelName: 'MathALEA',
            inOrderFields: ['Titre', 'url'],
            css: '/*\n  Author: Guillaume Valmont\n  Date : November 5, 2023\n  Licence: CC-BY-SA 4.0\n  https://forge.apps.education.fr/anki-templates/mathalea\n*/\n\n.loader-container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 75vh;\n}\n\n.loader {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  max-width: 15rem;\n}\n\n.loading-text {\n  position: absolute;\n  color: #f15929;\n  font-size: 1.5rem;\n}\n\n.loader:before,\n.loader:after {\n  content: "";\n  position: absolute;\n  border-radius: 50%;\n  animation: pulsOut 1.8s ease-in-out infinite;\n  filter: drop-shadow(0 0 1rem rgba(241, 89, 41, 0.75));\n  backface-visibility: hidden;\n}\n\n.loader:before {\n  width: 100%;\n  padding-bottom: 100%;\n  box-shadow: inset 0 0 0 1rem #f15929;\n  animation-name: pulsIn;\n}\n\n.loader:after {\n  width: calc(100% - 2rem);\n  padding-bottom: calc(100% - 2rem);\n  box-shadow: 0 0 0 0 #f15929;\n}\n\n@keyframes pulsIn {\n  0% {\n    box-shadow: inset 0 0 0 1rem #f15929;\n    opacity: 1;\n  }\n  50%, 100% {\n    box-shadow: inset 0 0 0 0 #f15929;\n    opacity: 0;\n  }\n}\n\n@keyframes pulsOut {\n  0%, 50% {\n    box-shadow: 0 0 0 0 #f15929;\n    opacity: 0;\n  }\n  100% {\n    box-shadow: 0 0 0 1rem #f15929;\n    opacity: 1;\n  }\n}\n',
            // "isCloze": false,
            cardTemplates: [
              {
                Name: 'Card 1',
                Front:
                  '\x3C!-- \n  Author: Guillaume Valmont\n  Date : November 15, 2023\n  Licence: CC-BY-SA 4.0\n  https://forge.apps.education.fr/anki-templates/mathalea\n-->\n\n<link rel="stylesheet" href="https://coopmaths.fr/alea/anki/mathalea-anki-style.css">\n\n<div id=\'recto-iframe-container\'>\n  <div class="loader-container">\n    <div class="loader">\n      <span class="loading-text">Chargement</span>\n    </div>\n  </div>\n</div>\n\n\x3Cscript src="https://coopmaths.fr/alea/anki/mathalea-anki-script.js" onload="executeIframeUpdate()">\x3C/script>\n\n\x3Cscript>\n  function executeIframeUpdate() {\n    rectoIframeUpdate((function () {/* {{url}} */ }).toString())\n  }\n\x3C/script>\n',
                Back: '\x3C!-- \n  Author: Guillaume Valmont\n  Date : November 15, 2023\n  Licence: CC-BY-SA 4.0\n  https://forge.apps.education.fr/anki-templates/mathalea\n-->\n\n<link rel="stylesheet" href="https://coopmaths.fr/alea/anki/mathalea-anki-style.css">\n\n<div id=\'verso-iframe-container\'>\n  <div class="loader-container">\n    <div class="loader">\n      <span class="loading-text">Chargement</span>\n    </div>\n  </div>\n</div>\n\n\x3Cscript src="https://coopmaths.fr/alea/anki/mathalea-anki-script.js" onload="executeIframeUpdate()">\x3C/script>\n\n\x3Cscript>\n  function executeIframeUpdate() {\n    versoIframeUpdate((function () {/* {{url}} */ }).toString())\n  }\n\x3C/script>\n',
              },
            ],
          })
        }
      })
      .then(() => {
        // Le deck ne sera créé que s'il n'existe pas
        return ankiConnect('createDeck', {
          deck: 'MathALÉA',
        })
      })
      .then(() => {
        return ankiConnect('canAddNotes', {
          notes,
        })
      })
      .then((can) => {
        return ankiConnect('addNotes', {
          notes: notes.filter((note, i) => can[i]), // On n'ajoute que les notes qui peuvent l'être (évite les doublons)
        })
      })
      .then((r) => {
        const nbExos = r.length
        const nbExosDejaPresent = notes.length - r.length
        logs += `${nbExos} ${nbExos > 1 ? 'exercices importés' : 'exercice importé'} ${nbExosDejaPresent ? `(dont ${nbExosDejaPresent} déjà présent${nbExosDejaPresent > 1 ? 's' : ''}) ` : ''}dans Anki avec succès !\n`
      })
      .catch((e) => {
        logs += "ERREUR, L'IMPORTATION N'A PAS RÉUSSI :\n\t" + e + '\n'
        logs += 'Veuillez vérifier que :\n'
        logs += '- Anki est bien installé sur votre ordinateur\n'
        logs += '- Le plugin AnkiConnect est bien installé et activé\n'
        logs += '- Anki est bien actuellement lancé\n'
      })
  }
</script>

<main
  class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {$darkMode.isActive
    ? 'dark'
    : ''}"
>
  <NavBar
    subtitle="Anki"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />

  <section
    class="px-4 py-0 md:py-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <h1
      class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
    >
      Comment l'utiliser ?
    </h1>

    <p
      class="text-coopmaths-corpus dark:text-coopmathsdark-corpus text-lg md:text-xl"
    >
      MathALÉA vous permet d'importer automatiquement les exercices sélectionné
      dans Anki.<br />
      Cette interface nécessite que
      <a
        href="https://apps.ankiweb.net/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-coopmaths-action dark:text-coopmathsdark-action">Anki</a
      >
      soit installé sur votre ordinateur avec le plugin
      <a
        href="https://ankiweb.net/shared/info/2055492159"
        target="_blank"
        rel="noopener noreferrer"
        class="text-coopmaths-action dark:text-coopmathsdark-action"
        >AnkiConnect</a
      >
      et que Anki soit <strong>actuellement lancé</strong> sur votre ordinateur.<br
      />Veuillez consulter la
      <a
        href="https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/Utilisation-de-Mathalea-avec-Anki"
        target="_blank"
        rel="noopener noreferrer"
        class="text-coopmaths-action dark:text-coopmathsdark-action"
        >documentation</a
      > pour plus d'information.
    </p>
    <h1
      class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
    >
      Importation
    </h1>

    <div
      class="flex flex-row w-full justify-center md:justify-start items-center"
    >
      {#if !chargement}
        <button
          type="submit"
          on:click={importer}
          class="p-2 rounded-xl text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
        >
          <i class="bx bx-download mr-2"></i>Importer les exercices dans Anki
        </button>
      {/if}
    </div>
    <div
      class="flex flex-row w-full justify-center md:justify-start items-center"
    >
      {#if logs}
        <pre
          class="my-10 shadow-md bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus p-4 w-full overflow-auto">{logs}</pre>
      {/if}
    </div>
  </section>
  <footer>
    <Footer />
  </footer>
</main>

<style>
  footer {
    margin-top: auto;
  }
</style>
