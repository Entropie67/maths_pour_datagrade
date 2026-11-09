;(() => {
  // Pour une raison inconnue JSzip ne fonctionne pas si requireJs est chargé
  // On contourne temporairement le soucis
  // const oldDefineAmd = window.define.amd
  window.define.amd = false
  const jsZipScript = document.createElement('script')
  jsZipScript.type = 'text/javascript'
  jsZipScript.src = 'https://coopmaths.fr/alea/assets/externalJs/jszip.min.js'
  document.body.appendChild(jsZipScript)
  // sera chargé à temps puisqu'on attend une interaction utilisateur ...

  // ////////////////////////////// //
  //    Modification de la popup    //
  // ////////////////////////////// //

  const isActivityChooser = !!document.querySelector('.modchooser')
  const isQuestionChooser = !!document.querySelector('.moodle-dialogue-base')

  if (!isActivityChooser && !isQuestionChooser) {
    alert(
      "Ce bouton doit être utilisé sur Moodle lorsque le sélecteur d'ajout d'activité ou de question est ouvert.",
    )
    return
  }

  let popup,
    SECTION,
    form,
    FORM_URL,
    COURSE_ID,
    CMID,
    SESSKEY,
    RETURN_URL,
    CATEGORY,
    ADDONPAGE,
    QTYPE,
    popupWidthCss

  if (isActivityChooser) {
    popup = document.querySelector('.modchooser')
    SECTION = new URL(
      popup
        .querySelector('a[data-action="add-chooser-option"]')
        .getAttribute('href'),
    ).searchParams.get('sectionid')
    if (SECTION !== null) {
      // Moodle 5.1
      SECTION = 'sectionid=' + SECTION
    } else {
      // < Moodle 5.1
      SECTION = new URL(
        popup
          .querySelector('a[data-action="add-chooser-option"]')
          .getAttribute('href'),
      ).searchParams.get('section')
      SECTION = 'section=' + SECTION
    }
    popup.setAttribute('style', 'max-width: 90% !important;')
    popup.querySelector('.modal-title').textContent =
      'Ajouter une activité MathALÉA'
    popup.querySelector('.modal-footer').style.display = 'none'
    popup.querySelector('.modal-body').innerHTML =
      '<iframe src="https://coopmaths.fr/alea/?recorder=moodle" style="width:100%;height:100vh;"></iframe>'
  }
  if (isQuestionChooser) {
    popup = document.querySelector('.moodle-dialogue-base')
    form = document.querySelector('#chooserform')
    FORM_URL = form.getAttribute('action')
    COURSE_ID = form.querySelector('input[name="courseid"]').value // new URL(document.querySelector('#page-navbar .breadcrumb-item a').getAttribute('href')).searchParams.get('id')
    CMID = form.querySelector('input[name="cmid"]').value // new URL(location.href).searchParams.get('cmid')
    SESSKEY = form.querySelector('input[name="sesskey"]').value // window.M.cfg.sesskey
    RETURN_URL = form.querySelector('input[name="returnurl"]').value
    CATEGORY = form.querySelector('input[name="category"]').value
    ADDONPAGE = form.querySelector('input[name="addonpage"]').value // En réalité inutile car on ne pourra pas positionner la question au bon endroit
    QTYPE = 'qtype=shortanswer'
    popupWidthCss = document.createElement('style')
    popupWidthCss.innerHTML =
      '.chooserdialogue-mod_quiz-questionchooser { width: 90% !important; }'
    document.head.appendChild(popupWidthCss)
    popup.querySelector('.moodle-dialogue-hd').textContent =
      'Ajouter une question de type MathALÉA'
    popup.querySelector('.moodle-dialogue-bd').innerHTML = `
      <label for="mathalea-bookmarklet-random">Type d'aléatoire</label>
      <select id="mathalea-bookmarklet-random">
        <option value="moodle">L'énoncé change à chaque nouvelle tentative du test Moodle et diffère pour chaque élève.</option>
        <option value="alea">L'énoncé change à chaque actualisation de la page.</option>
      </select>
      <iframe src="https://coopmaths.fr/alea/?recorder=moodle" style="width:100%;height:calc(100vh - 250px);"></iframe>`
  }

  let extractFormData = (url) => {
    // modedit.php?add=scorm&type=&course=1024&section=0&return=0&sr=0
    /*
      Cette fonction permet d'extraire les données du formulaire de création d'une activité.
      Elle retourne un objet contenant les données du formulaire.
      On peut ensuite utiliser ces données pour créer une activité.
    */
    return fetch(url)
      .then((x) => x.text())
      .then((x) => {
        let form = x.match(
          /<form [^>]*action="(?:modedit|question)\.php".*<\/form>/s,
        )[0]
        let formInputsDatas = Object.fromEntries(
          Array.from([
            ...form.matchAll(
              /<input[^>]*name="(?<name>[^"]*)"[^>]*value="(?<value>[^"]*)"[^>]*>/g,
            ),
            ...form.matchAll(
              /<input[^>]*value="(?<value>[^"]*)"[^>]*name="(?<name>[^"]*)"[^>]*>/g,
            ), // package file a l'ordre inversé
          ])
            .map((x) => {
              // cas particulier pour les cases à cocher
              // Il faut ign
              if (x[0].includes('type="checkbox"')) {
                if (x[0].includes('checked')) {
                  return [x.groups.name, x.groups.value]
                }
              } else {
                return [x.groups.name, x.groups.value]
              }
            })
            .filter((x) => x !== undefined),
        )
        let formTextareaDatas = Object.fromEntries(
          Array.from(
            form.matchAll(
              /<textarea[^>]*name="(?<name>[^"]*)"[^>]*>(?<value>[^<]*)<\/textarea>/g,
            ),
          ).map((x) => [x.groups.name, x.groups.value]),
        )
        // On récupère les données des selects. Si le select a un attribut selected on le prend, sinon on prend le premier
        let formSelectDatas = Object.fromEntries(
          Array.from(
            form.matchAll(
              /<select[^>]*name="(?<name>[^"]*)"[^>]*>(?<options>.*?)<\/select>/gs,
            ),
          ).map((x) => {
            let options = x.groups.options.match(
              /<option[^>]*value="(?<value>[^"]*)"[^>]*(selected)?>(?<text>[^<]*)<\/option>/g,
            ) || ['']
            let selectedOption =
              options.find((o) => o.includes('selected')) || options[0]
            let value =
              selectedOption.match(/value="(?<value>[^"]*)"/)?.groups?.value ||
              ''
            return [x.groups.name, value]
          }),
        )

        // Il reste encore des données dans le formulaire qui ne sont pas des inputs, textarea ou select ...

        // On fusionne les données
        const formDatas = {
          ...formInputsDatas,
          ...formTextareaDatas,
          ...formSelectDatas,
        }
        return formDatas
      })
  }

  let createExercices
  let createExercice

  if (isActivityChooser) {
    createExercices = (name, exercices, section) => {
      return () => {
        return extractFormData(
          'modedit.php?add=scorm&type=&course=' +
            new URL(
              document.querySelector('#page-navbar a')?.getAttribute('href') ||
                location.href,
            ).searchParams.get('id') +
            '&' +
            section,
        ).then((datas) => {
          console.log(
            "données récupérées pour la création d'un exercice",
            datas,
          )
          return new Promise((resolve, reject) => {
            // Créer un exercice
            // ////////////////////////////// //
            //     Création du SCORM          //
            // ////////////////////////////// //
            const zip = new window.JSZip()
            const xmlScorm = document.implementation.createDocument(
              '',
              '',
              null,
            )
            const xmlManifest = xmlScorm.createElement('manifest')
            xmlManifest.setAttribute('identifier', 'MathAlea')
            xmlManifest.setAttribute('version', '1.0')
            xmlScorm.appendChild(xmlManifest)
            /* <metadata>
            <schema>ADL SCORM</schema>
            <schemaversion>1.2</schemaversion>
            </metadata> */
            const xmlMetadata = xmlScorm.createElement('metadata')
            const xmlSchema = xmlScorm.createElement('schema')
            xmlSchema.textContent = 'ADL SCORM'
            const xmlSchemaVersion = xmlScorm.createElement('schemaversion')
            xmlSchemaVersion.textContent = '1.2'
            xmlMetadata.appendChild(xmlSchema)
            xmlMetadata.appendChild(xmlSchemaVersion)
            xmlManifest.appendChild(xmlMetadata)
            const xmlOrganizations = xmlScorm.createElement('organizations')
            xmlOrganizations.setAttribute('default', 'coopmaths.fr')
            const xmlOrganization = xmlScorm.createElement('organization')
            xmlOrganization.setAttribute('identifier', 'coopmaths.fr')
            xmlOrganization.setAttribute('structure', 'hierarchical')
            const xmlTitle = xmlScorm.createElement('title')
            xmlTitle.textContent = 'MathAlea'
            xmlOrganization.appendChild(xmlTitle)
            xmlOrganizations.appendChild(xmlOrganization)
            xmlManifest.appendChild(xmlOrganizations)
            const xmlResources = xmlScorm.createElement('resources')
            xmlManifest.appendChild(xmlResources)
            let i = 0
            for (const exercice of exercices) {
              const xmlItem = xmlScorm.createElement('item')
              xmlItem.setAttribute('identifier', `MathAlea-Exo${i + 1}`)
              xmlItem.setAttribute('isvisible', 'true')
              xmlItem.setAttribute('identifierref', `MathAlea-Exo${i + 1}`)
              const xmlTitle = xmlScorm.createElement('title')
              xmlTitle.textContent = exercice.titre
              xmlItem.appendChild(xmlTitle)
              xmlOrganization.appendChild(xmlItem)
              const xmlResource = xmlScorm.createElement('resource')
              xmlResource.setAttribute('identifier', `MathAlea-Exo${i + 1}`)
              xmlResource.setAttribute('type', 'webcontent')
              xmlResource.setAttribute('adlcp:scormtype', 'sco')
              xmlResource.setAttribute('href', 'index.html#' + exercice.url)
              const xmlDependency = xmlScorm.createElement('dependency')
              xmlDependency.setAttribute('identifierref', 'COMMON_FILES')
              xmlResource.appendChild(xmlDependency)
              xmlResources.appendChild(xmlResource)
              i++
            }
            const xmlResource = xmlScorm.createElement('resource')
            xmlResource.setAttribute('identifier', 'COMMON_FILES')
            xmlResource.setAttribute('type', 'webcontent')
            xmlResource.setAttribute('adlcp:scormtype', 'asset')
            const xmlFile = xmlScorm.createElement('file')
            xmlFile.setAttribute('href', 'index.html')
            xmlResource.appendChild(xmlFile)
            xmlResources.appendChild(xmlResource)
            let contentScorm = new XMLSerializer().serializeToString(xmlScorm)
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
            contentScorm =
              '<?xml version="1.0" encoding="UTF-8"?>\n' + contentScorm
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
            zip.generateAsync({ type: 'blob' }).then(function (file) {
              // ////////////////////////////// //
              //  Envoi du fichier sur Moodle   //
              // ////////////////////////////// //
              const formData = new FormData()
              formData.append('repo_upload_file', file, 'Activité MathALÉA.zip')
              formData.append('sesskey', window.M.cfg.sesskey)
              formData.append('repo_id', 5) // Pourrait changer, à surveiller !
              formData.append('itemid', datas['packagefile'])
              formData.append('author', 'Coopmaths')
              formData.append('savepath', '/')
              formData.append('title', 'Activité MathALÉA.zip')
              formData.append('ctx_id', window.M.cfg.contextid)
              formData.append('accepted_types[]', '.zip')
              formData.append('accepted_types[]', '.xml')
              formData.append(
                'course',
                new URL(
                  document
                    .querySelector('#page-navbar a')
                    ?.getAttribute('href') || location.href,
                ).searchParams.get('id'),
              )
              console.log('Envoi du fichier', name + '.zip', formData)
              fetch('../repository/repository_ajax.php?action=upload', {
                body: formData,
                method: 'post',
              })
                .then((x) => x.json())
                .then((x) => {
                  console.log('Fichier envoyé', x)

                  const formData = new FormData()
                  datas.name = name
                  // On a reçu des données de boutons qui ne seront pas cliqués
                  // On les supprime
                  delete datas.cancel
                  delete datas.submitbutton2
                  // D'autres données ne sont pas nécessaires
                  // En une ligne avec un forEach
                  ;[
                    'width',
                    'height',
                    'navpositionleft',
                    'navpositiontop',
                    'completionscorerequired',
                    'nav',
                    'timeopen[day]',
                    'timeopen[month]',
                    'timeopen[year]',
                    'timeopen[hour]',
                    'timeopen[minute]',
                    'timeclose[day]',
                    'timeclose[month]',
                    'timeclose[year]',
                    'timeclose[hour]',
                    'timeclose[minute]',
                    'completionexpected[day]',
                    'completionexpected[month]',
                    'completionexpected[year]',
                    'completionexpected[hour]',
                    'completionexpected[minute]',
                    'tags[]',
                  ].forEach((key) => {
                    delete datas[key]
                  })

                  datas.grademethod = 3 // Note totale
                  datas.forcenewattempt = 1 // Nouvelle tentative forcée
                  datas.availabilityconditionsjson =
                    '{"op":"&","c":[],"showc":[]}'

                  Object.entries(datas).forEach(([key, value]) => {
                    formData.append(key, value)
                  })

                  fetch('modedit.php', {
                    body: formData,
                    method: 'post',
                    redirect: 'follow',
                  }).then(() => {
                    console.log("Création d'un exercice", name)
                    resolve()
                  })
                })
                .catch(reject)
            })
          })
        })
      }
    }
  }

  if (isQuestionChooser) {
    createExercices = (exercices) => {
      return () => {
        // Lire le réglage une seule fois pour toutes les questions de l'ajout.
        const randomType = popup.querySelector(
          '#mathalea-bookmarklet-random',
        ).value
        return new Promise((resolve, reject) => {
          // Créer un exercice
          let i = 0
          let p = Promise.resolve()
          const actions = []

          for (const exercice of exercices) {
            actions.push(createExercice(exercice, randomType))
          }

          for (const action of actions) {
            p = p
              .then(() => action())
              .then(() => new Promise((resolve) => setTimeout(resolve, 250)))
          }

          p.then(resolve).catch(reject)
        })
      }
    }

    createExercice = (exercice, randomType) => {
      return () => {
        return new Promise((resolve, reject) => {
          return extractFormData(
            FORM_URL +
              `?courseid=${COURSE_ID}&sesskey=${SESSKEY}&${QTYPE}&returnurl=${RETURN_URL}&cmid=${CMID}&category=${CATEGORY}&addonpage=${ADDONPAGE}&noanswers=20`, // noanswers=20 très important pour éviter d'avori des erreurs 404 !
          )
            .then((datas) => {
              console.log(
                "données récupérées pour la création d'un exercice",
                datas,
              )
              console.log(JSON.stringify(datas))
              datas['appendqnumstring'] = 'addquestion'
              datas['submitbutton'] = 'Enregistrer'

              const answers = [
                '100',
                '90',
                '83.333',
                '80',
                '75',
                '66.666',
                '60',
                '50',
                '40',
                '33.333',
                '30',
                '25',
                '20',
                '16.666',
                '14.2857',
                '12.5',
                '11.111',
                '10',
                '5',
                '0',
              ]
              const fractions = [
                '1.0',
                '0.9',
                '0.8333333',
                '0.8',
                '0.75',
                '0.6666667',
                '0.6',
                '0.5',
                '0.4',
                '0.3333333',
                '0.3',
                '0.25',
                '0.2',
                '0.1666667',
                '0.1428571',
                '0.125',
                '0.1111111',
                '0.1',
                '0.05',
                '0.0',
              ]

              for (let j = 0; j < answers.length; j++) {
                datas[`answer[${j}]`] = answers[j] + '|*'
                datas[`fraction[${j}]`] = fractions[j]
              }

              // On a reçu des données de boutons qui ne seront pas cliqués
              // On les supprime
              // On supprime aussi tags[] qui pose problème
              ;[
                'addanswers',
                'addhint',
                'updatebutton',
                'cancel',
                'tags[]' /*'submitbutton', */,
              ].forEach((key) => {
                delete datas[key]
              })
              // ////////////////////////////// //
              //    Création de la question     //
              // ////////////////////////////// //
              datas.name = exercice.id
                ? `${exercice.id} - ${exercice.titre}`
                : exercice.titre
              // Sans attribut graine, moodle.js utilise l'identifiant de tentative
              // Moodle : l'énoncé reste identique lors d'une actualisation.
              const seedAttribute = randomType === 'alea' ? ' graine="-1"' : ''
              datas['questiontext[text]'] =
                `<script src\="https\://coopmaths.fr/alea/assets/externalJs/moodle.js" type\="module"></script>
        <mathalea-moodle v="4" url\="${exercice.url}"${seedAttribute}/>`
              datas['generalfeedback[text]'] =
                `<script src\="https\://coopmaths.fr/alea/assets/externalJs/moodle.js" type\="module"></script>
        <mathalea-moodle v="4" url\="${exercice.url}"${seedAttribute} correction />`

              fetch('/question/bank/editquestion/question.php', {
                body: new URLSearchParams(datas),
                method: 'post',
              })
                .then(() => {
                  console.log("Création d'un exercice", exercice.titre)
                  resolve()
                })
                .catch((e) => {
                  console.error(
                    "Erreur lors de la création de l'exercice",
                    exercice.titre,
                    e,
                  )
                  reject(e)
                })
            })
            .catch((e) => {
              console.error(
                "Erreur lors de la création de l'exercice",
                exercice.titre,
                e,
              )
              reject(e)
            })
        })
      }
    }
  }

  // ////////////////////////////// //
  //    Attente du postMessage      //
  // ////////////////////////////// //
  window.addEventListener(
    'message',
    (message) => {
      if (message.data.action === 'mathalea:activityParams') {
        const overlay = document.createElement('div')
        overlay.setAttribute(
          'style',
          'position: fixed;' +
            'height: 100%;' +
            'width: 100%;' +
            'background: rgba(255, 255, 255, 0.5);' +
            'z-index: 9999;' +
            'backdrop-filter: blur(2px);' +
            'cursor: wait;',
        )
        document.body.prepend(overlay)
        if (isActivityChooser) {
          let titre = 'Activité MathALÉA'
          if (message.data.exercices.length === 1) {
            titre = message.data.exercices[0].titre
          }
          createExercices(titre, message.data.exercices, SECTION)()
            .then(() => {
              location.reload()
            })
            .catch(() => {
              alert(
                "Une erreur est survenue lors de la création de l'activité.",
              )
              console.error(e)
              location.reload()
            })
        }
        if (isQuestionChooser) {
          createExercices(message.data.exercices)()
            .then(() => {
              location.reload()
            })
            .catch((e) => {
              alert(
                "Une erreur est survenue lors de la création de l'activité.",
              )
              console.error(e)
              location.reload()
            })
        }
        /*
      // ////////////////////////////// //
      //     Création du SCORM          //
      // ////////////////////////////// //
      const zip = new window.JSZip()
      const xmlScorm = document.implementation.createDocument('', '', null)
      const xmlManifest = xmlScorm.createElement('manifest')
      xmlManifest.setAttribute('identifier', 'MathAlea')
      xmlManifest.setAttribute('version', '1.0')
      xmlScorm.appendChild(xmlManifest)
      */
        /* <metadata>
      <schema>ADL SCORM</schema>
      <schemaversion>1.2</schemaversion>
      </metadata> */
        /*
      const xmlMetadata = xmlScorm.createElement('metadata')
      const xmlSchema = xmlScorm.createElement('schema')
      xmlSchema.textContent = 'ADL SCORM'
      const xmlSchemaVersion = xmlScorm.createElement('schemaversion')
      xmlSchemaVersion.textContent = '1.2'
      xmlMetadata.appendChild(xmlSchema)
      xmlMetadata.appendChild(xmlSchemaVersion)
      xmlManifest.appendChild(xmlMetadata)
      const xmlOrganizations = xmlScorm.createElement('organizations')
      xmlOrganizations.setAttribute('default', 'coopmaths.fr')
      const xmlOrganization = xmlScorm.createElement('organization')
      xmlOrganization.setAttribute('identifier', 'coopmaths.fr')
      xmlOrganization.setAttribute('structure', 'hierarchical')
      const xmlTitle = xmlScorm.createElement('title')
      xmlTitle.textContent = 'MathAlea'
      xmlOrganization.appendChild(xmlTitle)
      xmlOrganizations.appendChild(xmlOrganization)
      xmlManifest.appendChild(xmlOrganizations)
      const xmlResources = xmlScorm.createElement('resources')
      xmlManifest.appendChild(xmlResources)
      let i = 0
      for (const exercice of message.data.exercices) {
        const xmlItem = xmlScorm.createElement('item')
        xmlItem.setAttribute('identifier', `MathAlea-Exo${i + 1}`)
        xmlItem.setAttribute('isvisible', 'true')
        xmlItem.setAttribute('identifierref', `MathAlea-Exo${i + 1}`)
        const xmlTitle = xmlScorm.createElement('title')
        xmlTitle.textContent = exercice.titre
        xmlItem.appendChild(xmlTitle)
        xmlOrganization.appendChild(xmlItem)
        const xmlResource = xmlScorm.createElement('resource')
        xmlResource.setAttribute('identifier', `MathAlea-Exo${i + 1}`)
        xmlResource.setAttribute('type', 'webcontent')
        xmlResource.setAttribute('adlcp:scormtype', 'sco')
        xmlResource.setAttribute('href', 'index.html#' + exercice.url)
        const xmlDependency = xmlScorm.createElement('dependency')
        xmlDependency.setAttribute('identifierref', 'COMMON_FILES')
        xmlResource.appendChild(xmlDependency)
        xmlResources.appendChild(xmlResource)
        i++
      }
      const xmlResource = xmlScorm.createElement('resource')
      xmlResource.setAttribute('identifier', 'COMMON_FILES')
      xmlResource.setAttribute('type', 'webcontent')
      xmlResource.setAttribute('adlcp:scormtype', 'asset')
      const xmlFile = xmlScorm.createElement('file')
      xmlFile.setAttribute('href', 'index.html')
      xmlResource.appendChild(xmlFile)
      xmlResources.appendChild(xmlResource)
      let contentScorm = new XMLSerializer().serializeToString(xmlScorm)
      let ident = ''
      // Debut Beautify XML
      // Remarque : il s'agit d'un code maison qui ne gère probablement pas tous les cas
      //            mais suffit emplement ici
      let dir = 1
      contentScorm = '<' + contentScorm.split('<').slice(1).reduce((a, x) => {
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
      zip.file('imsmanifest.xml', contentScorm)
      let indexHtml = ''
      indexHtml += '<html>\n'
      indexHtml += '  <head>\n'
      indexHtml += '    <title>MathAlea</title>\n'
      indexHtml += '    <scr' + 'ipt type="text/javascript" src="https://coopmaths.fr/alea/assets/externalJs/SCORM_API_wrapper.js"></scr' + 'ipt>\n'
      indexHtml += '    <scr' + 'ipt type="text/javascript" src="https://coopmaths.fr/alea/assets/externalJs/moodle.scorm.js"></scr' + 'ipt>\n'
      indexHtml += '  </head>\n'
      indexHtml += '  <body></body>\n'
      indexHtml += '</html>\n'
      zip.file('index.html', indexHtml)
      zip.generateAsync({ type: 'blob' }).then(function (file) {
        // ////////////////////////////// //
        //  Envoi du fichier sur Moodle   //
        // ////////////////////////////// //
        const formData = new FormData()
        formData.append('repo_upload_file', file, message.data.exercices.length === 1 ? message.data.exercices[0].titre + '.zip' : 'Activité MathALÉA.zip')
        formData.append('sesskey', window.M.cfg.sesskey)
        formData.append('course', new URL(document.querySelector('#page-navbar a')?.getAttribute('href') || location.href).searchParams.get('id'))
        formData.append('section', SECTION)
        formData.append('module', 'scorm')
        formData.append('type', 'Files')

        fetch('dndupload.php', {
          body: formData,
          method: 'post'
        }).then(x => x.json())
          .then(x => {
            location.replace('../mod/scorm/view.php?id=' + x.cmid)
          })
      })
      */
      }
    },
    false,
  )
})()
