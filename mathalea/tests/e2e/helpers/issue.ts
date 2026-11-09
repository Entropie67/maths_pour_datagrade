// false : pas de connexion à la base des tickets
// true : création des tickets
// Si variable d'environnement : CI_TEST_TICKETS = CREATE alors on crée des tickets
const connection = false

const tickets = {
  nombreMax: 10,
  nombreInitial: 0,
}

export async function createIssue(
  urlExercice: string,
  messages: string[],
  labels: string[],
  log: (...args: unknown[]) => void,
) {
  if (
    process.env.CI &&
    process.env.CI_TEST_TICKETS !== null &&
    process.env.CI_TEST_TICKETS !== undefined &&
    process.env.CI_TEST_TICKETS === 'CREATE'
  ) {
    log('Création des tickets')
  } else if (!connection) {
    // pas de création de tickets
    //  log('Pas de création de tickets à la base des tickets')
    return
  }
  const token = process.env.MATHALEA_GITLAB_TOKEN
  if (!token) {
    log('Création de tickets désactivée : MATHALEA_GITLAB_TOKEN absent')
    return
  }
  if (tickets.nombreInitial >= tickets.nombreMax) {
    log('Nombre de tickets max atteint')
    return
  } else {
    tickets.nombreInitial++
  }

  const idPath = new URL(urlExercice).searchParams.get('id')

  labels.unshift('testIntegration')
  const formData = new FormData()
  const title = 'TI bug: ' + idPath
  formData.append('title', title)
  formData.append(
    'description',
    '```\n' + urlExercice + '\n' + messages.join('\n') + '\n```',
  )
  formData.append('labels', labels.join(','))

  // issues?search=foo&in=title
  let existIssue = true
  const headers = new Headers()
  headers.append('PRIVATE-TOKEN', token)
  await fetch(
    `https://forge.apps.education.fr/api/v4/projects/451/issues?search=${title}&in=title`,
    {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(60 * 1000),
    },
  )
    .then((res: Response) => {
      log('response.status =' + res.status)
      if (res.status === 200) {
        return res.json()
      }
    })
    .then((data) => {
      if (data instanceof Array) {
        const ouvert = data.find((ticket) => ticket.state === 'opened')
        if (!ouvert) {
          existIssue = false
        } else {
          log('Issued existed : ' + JSON.stringify(ouvert))
        }
      }
    })
    .catch((err) => {
      log('Error occured' + err)
      log(err.name)
    })

  if (existIssue) {
    return
  }

  // curl --header "PRIVATE-TOKEN:${MATHALEA_GITLAB_TOKEN}" --request POST --verbose --url "https://forge.apps.education.fr/api/v4/projects/451/issues?title=TItest&labels=TIlabels"

  await fetch('https://forge.apps.education.fr/api/v4/projects/451/issues', {
    method: 'POST',
    headers,
    body: formData,
    signal: AbortSignal.timeout(60 * 1000),
  }).then((res: Response) => {
    log('response.status =' + res.status)
    if (res.status === 201) {
      log('issue sended:' + urlExercice)
    } else {
      log('error to send issue:' + urlExercice)
    }
  })
}
