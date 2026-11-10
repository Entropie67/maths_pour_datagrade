<script lang="ts">
  import JSZip from 'jszip'
  import {
    mathaleaGetExercicesFromParams,
    mathaleaUpdateExercicesParamsFromUrl,
  } from '../../../lib/mathalea'
  import { canOptions } from '../../../lib/stores/canStore'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import {
    isIExercice,
    type IExercice,
    type IExerciceStatique,
    type InterfaceParams,
  } from '../../../lib/types'
  import Footer from '../../Footer.svelte'
  import ButtonToggleAlt from '../../shared/forms/ButtonToggleAlt.svelte'
  import FormRadio from '../../shared/forms/FormRadio.svelte'
  import InputNumber from '../../shared/forms/InputNumber.svelte'
  import InputText from '../../shared/forms/InputText.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import Tabs from '../../shared/ui/Tabs.svelte'

  function downloadGift(content: string, filename: string) {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function downloadScorm() {
    const zip = new JSZip()
    zip.file('imsmanifest.xml', contentScorm)
    let indexHtml = ''
    indexHtml += '<html>\n'
    indexHtml += '  <head>\n'
    indexHtml += '    <title>MathAlea</title>\n'
    indexHtml +=
      '    <scr' +
      'ipt type="text/javascript" src="https://coopmaths.fr/alea/assets/externalJs/SCORM_API_wrapper.js"></scr' +
      'ipt>\n'
    indexHtml +=
      '    <scr' +
      'ipt type="text/javascript" src="https://coopmaths.fr/alea/assets/externalJs/moodle.scorm.js"></scr' +
      'ipt>\n'
    indexHtml += '  </head>\n'
    indexHtml += '  <body></body>\n'
    indexHtml += '</html>\n'
    zip.file('index.html', indexHtml)
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mathalea.scorm.zip'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  let contentGift = ''
  let contentGiftCan = ''
  let contentScorm = ''

  /**
   * Les caractères `~ = # { } : \` sont réservés dans le format GIFT et doivent
   * y être échappés. `encodeURIComponent` neutralise tous ceux-là sauf `~`, que
   * l'on remplace donc par son encodage.
   */
  function giftUrlValue(value: string): string {
    return encodeURIComponent(value).replaceAll('~', '%7E')
  }

  /**
   * Traduit les paramètres d'un exercice en portion d'URL MathALÉA échappée pour
   * GIFT (`s\=3&n\=4…`). La graine est laissée de côté : elle est portée par
   * l'attribut `graine` de l'élément `<mathalea-moodle>`.
   */
  function buildParamUrl(param: InterfaceParams): string {
    let paramUrl = ''
    for (const key of Object.keys(param) as (keyof InterfaceParams)[]) {
      if (key === 'sup') {
        // 28-10-2025 Ajout de encodeURIComponent pour gérer DéfiTable correctement
        // A vérifier que ça ne casse pas d'autres choses
        paramUrl += `s\\=${encodeURIComponent(param[key] || '')}&`
      } else if (key === 'sup2') {
        paramUrl += `s2\\=${param[key]}&`
      } else if (key === 'sup3') {
        paramUrl += `s3\\=${param[key]}&`
      } else if (key === 'sup4') {
        paramUrl += `s4\\=${param[key]}&`
      } else if (key === 'sup5') {
        paramUrl += `s5\\=${param[key]}&`
      } else if (key === 'nbQuestions') {
        paramUrl += `n\\=${param[key]}&`
      } else if (key === 'versionQcm') {
        paramUrl += `qcm\\=${param[key]}&`
      } else if (key !== 'alea' && key !== 'id') {
        paramUrl += `${key}\\=${param[key]}&`
      }
    }
    return paramUrl.slice(0, -1)
  }

  /**
   * Graine de l'énoncé affiché : elle n'est dans l'URL que si celle-ci a été
   * partagée, sinon c'est celle que l'exercice s'est donnée à sa construction.
   */
  function currentSeed(
    param: InterfaceParams,
    exercice: IExercice | IExerciceStatique | undefined,
  ): string | undefined {
    if (param.alea != null) return param.alea
    return exercice != null && isIExercice(exercice) ? exercice.seed : undefined
  }

  const giftScriptTag =
    '<script src\\="https\\:\/\/coopmaths.fr\/alea\/assets\/externalJs\/moodle.js" type\\="module"><\/script>\n'

  /*
    Barème de la question GIFT : Moodle n'accepte qu'un jeu figé de fractions
    (1/1, 9/10, 5/6, 4/5…), le score transmis par MathALÉA est donc arrondi à la
    valeur la plus proche par `moodle.js`.
  */
  const giftScoreAnswers =
    '=%100%100|*=%90%90|*=%83.33333%83.333|*=%80%80|*=%75%75|*=%66.66667%66.666|*=%60%60|*=%50%50|*=%40%40|*=%33.33333%33.333|*=%30%30|*=%25%25|*=%20%20|*=%16.66667%16.666|*=%14.28571%14.2857|*=%12.5%12.5|*=%11.11111%11.111|*=%10%10|*=%5%5|*=%0%0|*\n'

  /*
    <organizations default="coopmaths.fr">
        <organization identifier="coopmaths.fr" structure="hierarchical">
          <title>MathAlea</title>
          <item identifier="MathAlea-Exo1" isvisible="true" identifierref="MathAlea-Exo1">
            <title>Décomposer un nombre entier en produit de (petits) facteurs premiers</title>
          </item>
          <item identifier="MathAlea-Exo2" isvisible="true" identifierref="MathAlea-Exo2">
            <title>Utiliser la simple distributivité</title>
          </item>
        </organization>
      </organizations>
      <resources>
        <resource identifier="MathAlea-Exo1" type="webcontent" adlcp:scormtype="sco"
          href="index.html#uuid=1eaf7&id=4A11-0&alea=3HRw">
          <dependency identifierref="COMMON_FILES"/>
        </resource>
        <resource identifier="MathAlea-Exo2" type="webcontent" adlcp:scormtype="sco"
          href="index.html#uuid=71dd8&id=4L10&alea=9QsD">
          <dependency identifierref="COMMON_FILES"/>
        </resource>
        <resource identifier="COMMON_FILES" type="webcontent" adlcp:scormtype="asset">
          <file href="index.html" />
        </resource>
      </resources>
  */
  let exercices: (IExercice | IExerciceStatique)[] = []

  let justBookmarklet = false

  async function initExercices() {
    contentGift = ''
    let xmlScorm = document.implementation.createDocument('', '', null)
    let xmlManifest = xmlScorm.createElement('manifest')
    xmlManifest.setAttribute('identifier', 'MathAlea')
    xmlManifest.setAttribute('version', '1.0')
    xmlScorm.appendChild(xmlManifest)
    /*<metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    </metadata>*/
    let xmlMetadata = xmlScorm.createElement('metadata')
    let xmlSchema = xmlScorm.createElement('schema')
    xmlSchema.textContent = 'ADL SCORM'
    let xmlSchemaVersion = xmlScorm.createElement('schemaversion')
    xmlSchemaVersion.textContent = '1.2'
    xmlMetadata.appendChild(xmlSchema)
    xmlMetadata.appendChild(xmlSchemaVersion)
    xmlManifest.appendChild(xmlMetadata)
    let xmlOrganizations = xmlScorm.createElement('organizations')
    xmlOrganizations.setAttribute('default', 'coopmaths.fr')
    let xmlOrganization = xmlScorm.createElement('organization')
    xmlOrganization.setAttribute('identifier', 'coopmaths.fr')
    xmlOrganization.setAttribute('structure', 'hierarchical')
    let xmlTitle = xmlScorm.createElement('title')
    xmlTitle.textContent = 'MathAlea'
    xmlOrganization.appendChild(xmlTitle)
    xmlOrganizations.appendChild(xmlOrganization)
    xmlManifest.appendChild(xmlOrganizations)
    let xmlResources = xmlScorm.createElement('resources')
    xmlManifest.appendChild(xmlResources)
    let scormItemsCount = 0
    /** Ajoute un SCO au manifeste : un élément du sommaire et sa ressource. */
    function addScormItem(titre: string, url: string) {
      scormItemsCount++
      const identifier = `MathAlea-Exo${scormItemsCount}`
      const xmlItem = xmlScorm.createElement('item')
      xmlItem.setAttribute('identifier', identifier)
      xmlItem.setAttribute('isvisible', 'true')
      xmlItem.setAttribute('identifierref', identifier)
      const xmlItemTitle = xmlScorm.createElement('title')
      xmlItemTitle.textContent = titre
      xmlItem.appendChild(xmlItemTitle)
      xmlOrganization.appendChild(xmlItem)
      const xmlResource = xmlScorm.createElement('resource')
      xmlResource.setAttribute('identifier', identifier)
      xmlResource.setAttribute('type', 'webcontent')
      xmlResource.setAttribute('adlcp:scormtype', 'sco')
      xmlResource.setAttribute('href', 'index.html#' + url)
      const xmlDependency = xmlScorm.createElement('dependency')
      xmlDependency.setAttribute('identifierref', 'COMMON_FILES')
      xmlResource.appendChild(xmlDependency)
      xmlResources.appendChild(xmlResource)
    }
    mathaleaUpdateExercicesParamsFromUrl()
    exercices = await mathaleaGetExercicesFromParams($exercicesParams)
    if (exercices.length === 0) {
      tab = 'bookmarklet'
      justBookmarklet = true
    }
    let i = 0
    for (const param of $exercicesParams) {
      const paramUrl = buildParamUrl(param)
      const exercice = exercices[i]
      const titre = isIExercice(exercice)
        ? exercice.titre
        : (param.id ?? param.uuid)
      const nbQuestions = isIExercice(exercice) ? exercice.nbQuestions : 1
      let graine
      if (aleaType === 'alea') {
        graine = ' graine\\="-1"'
      } else if (aleaType === 'moodle') {
        graine = ''
      } else {
        graine = ` graine\\="${currentSeed(param, exercice)}" `
      }
      contentGift += `:: ${param.id} - ${titre} - ${nbQuestions} ${nbQuestions > 1 ? 'questions' : 'question'} ::\n`
      contentGift += giftScriptTag
      contentGift += `<mathalea-moodle v="4" url\\="${paramUrl}"${showTitle ? '' : ' titre="false"'}${graine}/>\n`
      contentGift += '{\n'
      contentGift += giftScoreAnswers
      contentGift += '####' + giftScriptTag
      contentGift += `<mathalea-moodle v="4" url\\="${paramUrl}"${showTitle ? '' : ' titre="false"'}${graine} correction />\n`
      contentGift += '}\n\n'
      if (scormView === 'classique') {
        addScormItem(titre, buildScormExerciceUrl(param, exercice))
      }
      i++
    }
    buildGiftCan()
    if (scormView === 'can' && $exercicesParams.length > 0) {
      addScormItem(canFullTitle(), buildScormCanUrl())
    }
    let xmlResource = xmlScorm.createElement('resource')
    xmlResource.setAttribute('identifier', 'COMMON_FILES')
    xmlResource.setAttribute('type', 'webcontent')
    xmlResource.setAttribute('adlcp:scormtype', 'asset')
    let xmlFile = xmlScorm.createElement('file')
    xmlFile.setAttribute('href', 'index.html')
    xmlResource.appendChild(xmlFile)
    xmlResources.appendChild(xmlResource)
    contentScorm = new XMLSerializer().serializeToString(xmlScorm)
    let ident = ''
    // Debut Beautify XML
    // Remarque : il s'agit d'un code maison qui ne gère probablement pas tous les cas
    //            mais suffit emplement ici
    let dir = 1
    contentScorm =
      '<' +
      contentScorm
        .split('<')
        .slice(1)
        .reduce((a, x) => {
          if (x[0] === '/') {
            if (dir === 1) {
              a += '<' + x
            } else {
              a += '\n' + ident + '<' + x
            }
            ident = ident.slice(1)
            dir = -1
          } else {
            ident += ' '
            a += '\n' + ident + '<' + x
            dir = 1
            if (x.includes('/>')) {
              ident = ident.slice(1)
              dir = -1
            }
          }
          return a
        })
    // Fin Beautify XML
    contentScorm = '<?xml version="1.0" encoding="UTF-8"?>\n' + contentScorm
  }

  /**
   * Construit l'unique question GIFT qui contient toute la Course aux nombres :
   * l'élève y court sur l'ensemble des exercices, la note transmise à Moodle
   * étant le total des points sur le total des questions.
   */
  function buildGiftCan() {
    contentGiftCan = ''
    if ($exercicesParams.length === 0) return
    /*
      Les exercices sont réunis dans une seule URL. La graine est traitée comme
      pour l'export d'exercices : soit tirée au sort à chaque affichage
      (`graine="-1"`), soit déduite de la question Moodle, soit celle des
      énoncés actuels — auquel cas elle voyage dans l'URL, exercice par
      exercice, et `moodle.js` n'en injecte pas.
    */
    const paramsUrl = $exercicesParams
      .map((param, index) => {
        const seed =
          aleaType === 'graine'
            ? currentSeed(param, exercices[index])
            : undefined
        return seed == null
          ? buildParamUrl(param)
          : `${buildParamUrl(param)}&alea\\=${seed}`
      })
      .join('&')
    const canUrl = paramsUrl + canSettingsUrl().replaceAll('=', '\\=')
    const graine = aleaType === 'alea' ? ' graine\\="-1"' : ''
    const nbQuestions = exercices.reduce(
      (total, exercice) =>
        total + (isIExercice(exercice) ? exercice.nbQuestions : 1),
      0,
    )
    const titre = canFullTitle()
    contentGiftCan += `:: ${titre} - ${nbQuestions} ${nbQuestions > 1 ? 'questions' : 'question'} ::\n`
    contentGiftCan += giftScriptTag
    contentGiftCan += `<mathalea-moodle v="4" can url\\="${canUrl}"${graine}/>\n`
    contentGiftCan += '{\n'
    contentGiftCan += giftScoreAnswers
    contentGiftCan += '####' + giftScriptTag
    contentGiftCan += `<mathalea-moodle v="4" can url\\="${canUrl}"${graine} correction />\n`
    contentGiftCan += '}\n\n'
  }

  /**
   * Réglages de la Course aux nombres, sous forme d'URL non échappée
   * (`&canD=…&canTi=…`). Les valeurs ne contiennent jamais de `=` brut : elles
   * sont encodées par `giftUrlValue`.
   */
  function canSettingsUrl(): string {
    return (
      `&canD=${canDuration}` +
      `&canTi=${giftUrlValue(canTitle)}` +
      `&canT=${giftUrlValue(canSubTitle)}` +
      `&canSA=${canSolutionsAccess ? '1' : '0'}` +
      `&canSM=${$canOptions.solutionsMode}` +
      // La course doit être interactive : sans champ de saisie, il n'y aurait
      // ni réponse à enregistrer ni score à transmettre à Moodle.
      '&canI=1' +
      (canIsTimerDisabled ? '&canNC=1' : '')
    )
  }

  function canFullTitle(): string {
    return [canTitle, canSubTitle].filter((part) => part !== '').join(' ')
  }

  /*
    URL d'un SCO, lue par `moodle.scorm.js` dans l'ancre de `index.html`. Sans
    `alea`, celui-ci tire une graine propre à chaque tentative de l'élève et la
    conserve dans `cmi.suspend_data`.
  */
  function buildScormExerciceUrl(
    param: InterfaceParams,
    exercice: IExercice | IExerciceStatique | undefined,
  ): string {
    const seed =
      scormAleaType === 'graine' ? currentSeed(param, exercice) : undefined
    return (
      buildParamUrl(param).replaceAll('\\=', '=') +
      (seed == null ? '' : `&alea=${seed}`) +
      // Mêmes réglages de la vue élève que `moodle.js`, sans titre ni référence
      (showTitle ? '' : '&es=01101000')
    )
  }

  /*
    Une Course aux nombres tient dans un seul SCO. En graine aléatoire, chaque
    exercice reçoit `alea=-1-rang` : `moodle.scorm.js` remplace `-1` par la
    graine de l'élève, et le rang évite que deux exercices identiques posent la
    même question.
  */
  function buildScormCanUrl(): string {
    const paramsUrl = $exercicesParams
      .map((param, index) => {
        const seed =
          scormAleaType === 'graine'
            ? currentSeed(param, exercices[index])
            : `-1-${index}`
        return (
          buildParamUrl(param).replaceAll('\\=', '=') +
          (seed == null ? '' : `&alea=${seed}`)
        )
      })
      .join('&')
    return paramsUrl + canSettingsUrl() + '&v=can'
  }

  let aleaType = 'alea' // 'alea' | 'moodle' | 'graine'
  let scormAleaType: 'alea' | 'graine' = 'alea'
  // Vue choisie dans l'onglet SCORM : un SCO par exercice ou Course aux nombres
  let scormView: 'classique' | 'can' = 'classique'
  let showTitle = true
  // Réglages de la Course aux nombres, initialisés avec ceux de la page d'accueil
  let canDuration = $canOptions.durationInMinutes
  let canTitle = $canOptions.title
  let canSubTitle = $canOptions.subTitle
  let canSolutionsAccess = $canOptions.solutionsAccess
  let canIsTimerDisabled = $canOptions.isTimerDisabled
  $: {
    aleaType
    scormAleaType
    scormView
    showTitle
    canDuration
    canTitle
    canSubTitle
    canSolutionsAccess
    canIsTimerDisabled
    initExercices()
  }

  let tab = 'gift'
  // Vue choisie dans l'onglet Gift : question classique ou Course aux nombres
  let giftView: 'classique' | 'can' = 'classique'

  $: moodleTabs = justBookmarklet
    ? [
        {
          id: 'bookmarklet',
          label: 'Marque-page magique',
          ariaControls: 'tabs-bookmarklet',
        },
      ]
    : [
        { id: 'gift', label: 'Export Gift', ariaControls: 'tabs-gift' },
        { id: 'scorm', label: 'Export SCORM', ariaControls: 'tabs-scorm' },
        {
          id: 'bookmarklet',
          label: 'Marque-page magique',
          ariaControls: 'tabs-bookmarklet',
        },
      ]

  function handleTabChange(e: CustomEvent<string>) {
    tab = e.detail
  }
</script>

{#snippet canSettings(idPrefix: string)}
  <div
    class="pl-2 pb-2 mt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Course aux nombres
  </div>
  <div class="pl-2 flex flex-col space-y-3 max-w-md">
    <InputText
      title="Titre"
      inputID="{idPrefix}-can-title"
      bind:value={canTitle}
    />
    <InputText
      title="Sous-titre"
      inputID="{idPrefix}-can-subtitle"
      bind:value={canSubTitle}
    />
    <div>
      <div
        class="font-light text-sm text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Durée (en minutes)
      </div>
      <InputNumber
        id="{idPrefix}-can-duration"
        min={1}
        max={120}
        ariaLabel="Durée de la course en minutes"
        bind:value={canDuration}
      />
    </div>
    <!--
      `id` explicite : celui par défaut est fondé sur l'horodatage et deux
      interrupteurs créés dans la même milliseconde le partageraient, rendant
      leur libellé incliquable. Le préfixe distingue les onglets Gift et SCORM,
      qui restent tous deux dans le DOM.
    -->
    <ButtonToggleAlt
      id="{idPrefix}-can-no-timer"
      title={'Course sans chronomètre'}
      bind:value={canIsTimerDisabled}
      explanations={[
        "La course n'est pas chronométrée : l'élève la termine quand il le souhaite",
        'La course est chronométrée',
      ]}
    />
    <ButtonToggleAlt
      id="{idPrefix}-can-solutions"
      title={'Accès aux corrections'}
      bind:value={canSolutionsAccess}
      explanations={[
        "L'élève voit les corrections à la fin de la course",
        "L'élève ne voit que son score à la fin de la course",
      ]}
    />
  </div>
{/snippet}

<main
  class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {$darkMode.isActive
    ? 'dark'
    : ''}"
>
  <NavBar
    subtitle="Moodle"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />
  <div
    class="flex flex-col h-full w-full bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <div
      class="h-full w-full md:w-2/3 lg:w-3/5 flex flex-col px-4 pb-4 md:py-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark mx-auto"
    >
      <!--
      <div
        class="flex flex-col md:flex-row justify-start px-4 py-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <h3
          class="font-bold text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          Choix du type d'export Moodle
        </h3>
      </div>
      -->
      <!-- Tabulations pour la présentation -->
      <Tabs tabs={moodleTabs} activeTab={tab} on:change={handleTabChange} />
      <!-- Pages des réglages -->
      <div class="pb-6 pt-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
        <div
          class="transition-opacity duration-150 ease-linear {tab === 'gift'
            ? 'block opacity-100'
            : 'hidden opacity-0'}"
          id="tabs-gift"
          role="tabpanel"
          aria-labelledby="tabs-gift-btn"
        >
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            <!-- DEBUT GIFT -->
            <section
              class="px-4 py-0 md:py-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas w-full"
            >
              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Comment l'utiliser ?
              </h1>

              {#if giftView === 'classique'}
                <p
                  class="text-coopmaths-corpus dark:text-coopmathsdark-corpus text-lg md:text-xl"
                >
                  MathALÉA vous permet de créer un fichier au format gift que
                  vous pourrez ensuite importer dans la banque de questions de
                  votre plateforme Moodle. Vous trouverez de plus amples
                  informations dans notre <a
                    href="https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/Utilisation-de-Mathalea-avec-Moodle"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-coopmaths-action dark:text-coopmathsdark-action"
                    >documentation</a
                  >.
                </p>
              {:else}
                <p
                  class="text-coopmaths-corpus dark:text-coopmathsdark-corpus text-lg md:text-xl"
                >
                  Cet export réunit tous les exercices sélectionnés dans une
                  <strong>unique question</strong>
                  de test Moodle, présentée sous la forme d'une Course aux nombres
                  chronométrée. La note transmise à Moodle est le total des points
                  obtenus rapporté au nombre de questions de la course, et la copie
                  de l'élève est réaffichée avec les corrections une fois le test
                  terminé.
                </p>
              {/if}
              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Exportation
              </h1>

              <div class="flex flex-col justify-center items-center space-y-2">
                <div class="pl-4 pt-4">
                  <div
                    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                  >
                    Vue
                  </div>
                  <FormRadio
                    title="Vue"
                    bind:valueSelected={giftView}
                    labelsValues={[
                      { label: 'Vue classique', value: 'classique' },
                      { label: 'Vue Course aux nombres', value: 'can' },
                    ]}
                  />
                  <div
                    class="pl-2 pb-2 mt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                  >
                    Aléatoire
                  </div>
                  {#if giftView === 'classique'}
                    <FormRadio
                      title="Type d'aléatoire"
                      bind:valueSelected={aleaType}
                      labelsValues={[
                        {
                          label:
                            "L'énoncé change à chaque actualisation de la page",
                          value: 'alea',
                        },
                        {
                          label:
                            "L'énoncé change à chaque nouvelle tentative du test Moodle et est différente pour chaque élève",
                          value: 'moodle',
                        },
                        {
                          label: "Pas d'aléatoire (utiliser l'énoncé actuel')",
                          value: 'graine',
                        },
                      ]}
                    />
                    <div
                      class="pl-2 pb-2 mt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                    >
                      Autres options
                    </div>
                    <ButtonToggleAlt
                      id="gift-show-title"
                      title={'Afficher le titre'}
                      bind:value={showTitle}
                      explanations={[
                        "Le titre et la référence de l'exercice seront affichés",
                        "Le titre et la référence de l'exercice ne seront pas affichés",
                      ]}
                    />
                  {:else}
                    <!--
                      `title` sert à nommer le groupe de boutons radio : il doit
                      différer de celui de la vue classique, dont les boutons
                      restent dans le DOM (masqués) et liés au même réglage.
                    -->
                    <FormRadio
                      title="Type d'aléatoire de la course"
                      bind:valueSelected={aleaType}
                      labelsValues={[
                        {
                          label:
                            'Les énoncés changent à chaque actualisation de la page',
                          value: 'alea',
                        },
                        {
                          label:
                            'Les énoncés changent à chaque nouvelle tentative du test Moodle et sont différents pour chaque élève',
                          value: 'moodle',
                        },
                        {
                          label:
                            "Pas d'aléatoire (utiliser les énoncés actuels)",
                          value: 'graine',
                        },
                      ]}
                    />
                    {@render canSettings('gift')}
                  {/if}
                </div>
                <button
                  type="submit"
                  on:click={() =>
                    giftView === 'classique'
                      ? downloadGift(contentGift, 'mathalea-gift.txt')
                      : downloadGift(contentGiftCan, 'mathalea-gift-can.txt')}
                  class="p-2 rounded-xl text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
                >
                  <i class="bx bx-download mr-2"></i>Télécharger le fichier gift
                </button>
              </div>
              <h1
                class="mt-12 md:mt-8 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Code
              </h1>
              <pre
                class="my-10 shadow-md bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus p-4 w-full overflow-auto">{giftView ===
                'classique'
                  ? contentGift
                  : contentGiftCan}
            </pre>
            </section>
            <!-- FIN GIFT -->
          </div>
        </div>
        <div
          class="transition-opacity duration-150 ease-linear {tab === 'scorm'
            ? 'block opacity-100'
            : 'hidden opacity-0'}"
          id="tabs-scorm"
          role="tabpanel"
          aria-labelledby="tabs-scorm-btn"
        >
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            <!-- DEBUT SCORM -->
            <section
              class="px-4 py-0 md:py-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas w-full"
            >
              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Comment l'utiliser ?
              </h1>

              <p
                class="text-coopmaths-corpus dark:text-coopmathsdark-corpus text-lg md:text-xl"
              >
                MathALÉA vous permet de créer un fichier au format SCORM que
                vous pourrez ensuite importer dans votre cours Moodle. Vous
                trouverez de plus amples informations dans notre <a
                  href="https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/Utilisation-de-Mathalea-avec-Moodle"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-coopmaths-action dark:text-coopmathsdark-action"
                  >documentation</a
                >.
              </p>
              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Exportation
              </h1>

              <div class="flex flex-col justify-center items-center space-y-2">
                <div class="pl-4 pt-4">
                  <div
                    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                  >
                    Vue
                  </div>
                  <!--
                    `title` sert à nommer les groupes de boutons radio : il doit
                    différer de ceux de l'onglet Gift, qui restent dans le DOM.
                  -->
                  <FormRadio
                    title="Vue SCORM"
                    bind:valueSelected={scormView}
                    labelsValues={[
                      { label: 'Vue classique', value: 'classique' },
                      { label: 'Vue Course aux nombres', value: 'can' },
                    ]}
                  />
                  <div
                    class="pl-2 pb-2 mt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                  >
                    Aléatoire
                  </div>
                  <FormRadio
                    title="Type d'aléatoire SCORM"
                    bind:valueSelected={scormAleaType}
                    labelsValues={[
                      {
                        label:
                          scormView === 'classique'
                            ? "L'énoncé change à chaque nouvelle tentative et est différent pour chaque élève"
                            : 'Les énoncés changent à chaque nouvelle tentative et sont différents pour chaque élève',
                        value: 'alea',
                      },
                      {
                        label:
                          scormView === 'classique'
                            ? "Pas d'aléatoire (utiliser l'énoncé actuel)"
                            : "Pas d'aléatoire (utiliser les énoncés actuels)",
                        value: 'graine',
                      },
                    ]}
                  />
                  {#if scormView === 'classique'}
                    <div
                      class="pl-2 pb-2 mt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                    >
                      Autres options
                    </div>
                    <ButtonToggleAlt
                      id="scorm-show-title"
                      title={'Afficher le titre'}
                      bind:value={showTitle}
                      explanations={[
                        "Le titre et la référence de l'exercice seront affichés",
                        "Le titre et la référence de l'exercice ne seront pas affichés",
                      ]}
                    />
                  {:else}
                    {@render canSettings('scorm')}
                  {/if}
                </div>

                <button
                  type="submit"
                  on:click={downloadScorm}
                  class="p-2 rounded-xl text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
                >
                  <i class="bx bx-download mr-2"></i>Télécharger le fichier
                  SCORM
                </button>
              </div>
              <h1
                class="mt-12 md:mt-8 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Code
              </h1>
              <pre
                class="my-10 shadow-md bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus p-4 w-full overflow-auto">{contentScorm}</pre>
            </section>
            <!-- FIN SCORM -->
          </div>
        </div>
        <div
          class="transition-opacity duration-150 ease-linear {tab ===
          'bookmarklet'
            ? 'block opacity-100'
            : 'hidden opacity-0'}"
          id="tabs-bookmarklet"
          role="tabpanel"
          aria-labelledby="tabs-bookmarklet-btn"
        >
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            <!-- DEBUT BOOKMARKLET -->
            <section
              class="px-4 py-0 md:py-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas w-full"
            >
              <p
                class="text-coopmaths-corpus dark:text-coopmathsdark-corpus text-lg md:text-xl"
              >
                Le marque-page magique permet de créer des activités MathALÉA
                (au format scorm) ou des questions dans un test Moodle/ELEA en
                un clic.<br />
                <center
                  ><img
                    src="./assets/images/moodle-bookmarklet-demo.gif"
                    alt="Vidéo de démonstration du marque-page magique"
                    style="height:400px;margin:10px;"
                  /></center
                >
              </p>
              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Installation du marque-page magique
              </h1>
              Glissez déposez le lien ci-dessous dans votre barre de favoris / marque
              page :<br />
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a
                href="javascript:var MathAleaBookmarkletScript = document.createElement('script');MathAleaBookmarkletScript.type='text/javascript';MathAleaBookmarkletScript.src='https://coopmaths.fr/alea/assets/externalJs/moodle-bookmarklet.js?v=3';document.body.appendChild(MathAleaBookmarkletScript);void(0);"
                style="color:blue;text-decoration:underline;"
                >Activité MathALÉA</a
              >

              <center
                ><img
                  src="./assets/images/moodle-bookmarklet-installation.gif"
                  alt="Vidéo d'installation du marque-page magique"
                  style="margin:10px;border: 1px solid black;filter:drop-shadow(2px 4px 6px black);transform: scale(0.9) rotate(-5deg) translate(20px, 20px);"
                /></center
              ><br />

              <h1
                class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
              >
                Utilisation
              </h1>

              <ul style="list-style-type: square;margin-left:30px;">
                <li>
                  Pour utilisez le marque-page magique pour créer une <strong
                    >activité MathALÉA</strong
                  >
                  :
                  <ul style="list-style-type: square;margin-left:30px;">
                    <li>Ouvrez la page d'un cours en mode édition.</li>
                    <li>
                      Appuyez sur le bouton permettant d'ajouter une activité à
                      une section.
                    </li>
                    <li>
                      Lorsque le sélecteur d'activité s'affiche, appuyez sur le
                      marque-page magique.
                    </li>
                    <li>
                      La fenêtre vous propose alors de choisir un ou plusieurs
                      exercices MathALÉA à ajouter à votre cours.
                    </li>
                    <li>
                      Une fois les exercices choisis, appuyez sur le bouton
                      "Ajouter" pour les insérer dans votre cours.
                    </li>
                  </ul>
                </li>
                <li>
                  Pour utilisez le marque-page magique pour créer une <strong
                    >question MathALÉA</strong
                  >
                  dans un test :
                  <ul style="list-style-type: square;margin-left:30px;">
                    <li>Se rendre dans l'onglet Questions d'un test</li>
                    <li>
                      Appuyez sur le bouton "Ajouter" puis choisir "Une
                      question"
                    </li>
                    <li>
                      Lorsque le sélecteur de type de questions s'affiche,
                      appuyez sur le marque-page magique.
                    </li>
                    <li>
                      La fenêtre vous propose alors de choisir un ou plusieurs
                      exercices MathALÉA à ajouter à votre cours.
                    </li>
                    <li>
                      Une fois les exercices choisis, appuyez sur le bouton
                      "Ajouter" pour les insérer dans votre quiz (à la fin).
                    </li>
                    <li>
                      Par défaut, l'énoncé change à chaque nouvelle tentative du
                      test et diffère pour chaque élève. Le menu « Type
                      d'aléatoire » permet aussi de choisir un changement à
                      chaque actualisation de la page.
                    </li>
                    <li>
                      Le nom de chaque question dans la banque comprend la
                      référence et le titre de l'exercice.
                    </li>
                  </ul>
                </li>
              </ul>
              <!--
                <strong
                >Important : en raison d'un bug moodle, le calcul du score sera
                incorrect dans le cas où plusieurs exercices ont été choisis. Il
                faut donc pour l'instant se limiter à un exercice par activité
                MathALÉA.</strong
                ><br />
              -->
              L'utilisation du marque-page magique revient à importer un
              <strong>fichier SCORM</strong>, ou à importer une question au
              format <strong>GIFT</strong> dans un test Moodle. Le marque-page
              magique ne fait que simplifier le procéssus de création.<br />
              Reportez-vous à la
              <a
                href="https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/1.-Utilisation-de-MathAL%C3%89A/1.2-Int%C3%A9gration-avec-d'autres-plateformes/Utilisation-de-Mathalea-avec-Moodle-ELEA"
                style="text-decoration:underline;">documentation</a
              > pour plus d'information.
            </section>
            <!-- FIN BOOKMARKLET -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <Footer />
  </footer>
</main>

<style>
  footer {
    margin-top: auto;
  }
</style>
