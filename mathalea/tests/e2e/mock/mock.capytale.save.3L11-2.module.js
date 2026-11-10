// MGU 01/03/ 2025 attention à laisser en JS.
// C'est un fichier qui est injecté directement dans le navigateur de playwright pour similer le module capytale.

// eslint-disable-next-line import-x/no-absolute-path
import * as RPCm from '/alea/node_modules/.vite/deps/@mixer_postmessage-rpc.js'

const RPC = RPCm.default.RPC

const serviceId = 'capytale-player'

const myIframe = document.querySelector('iframe')
const rpc = new RPC({
  // The window you want to talk to:
  target: myIframe.contentWindow,
  // This should be unique for each of your producer<->consumer pairs:
  serviceId,

  // Optionally, allowlist the origin you want to talk to:
  origin: '*',
})

const activityParams = {
  mode: 'assignment',
  workflow: 'current',
  activity: {
    exercicesParams: [
      {
        uuid: 'f6853',
        interactif: '1',
        id: '3L11-2',
        nbQuestions: 7,
        duration: 10,
        sup: 'false',
        sup2: 'false',
        sup3: '9',
        cd: '1',
        alea: 'Qdg3',
        bestScore: 4,
      },
    ],
    globalOptions: {
      v: 'eleve',
      z: '1',
      durationGlobal: 0,
      nbVues: 1,
      flow: 0,
      isImagesOnSides: false,
      sound: 0,
      shuffle: false,
      select: [],
      order: [],
      title: '',
      presMode: 'un_exo_par_page',
      setInteractive: '1',
      isSolutionAccessible: false,
      isInteractiveFree: false,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
      recorder: 'capytale',
      beta: false,
      iframe: '',
      answers: '',
      isDataRandom: true,
    },
    canOptions: {
      durationInMinutes: 4,
      subTitle: '2025',
      isChoosen: false,
      solutionsAccess: false,
      solutionsMode: 'gathered',
      isInteractive: true,
      remainingTimeInSeconds: 0,
      questionGetAnswer: [],
      state: 'canHomeScreen',
    },
  },
  studentAssignment: [
    {
      uuid: 'f6853',
      title: 'Réduire une expression',
      indice: 0,
      state: 'done',
      alea: '8toN',
      answers: {
        Ex0Q0: '-4\\lparen2x-1\\rparen',
        Ex0Q1: '45x',
        Ex0Q2: '5x+2',
        Ex0Q3: '2\\lparen6+11x\\rparen',
        Ex0Q4: '-64x',
        Ex0Q5: '-x\\lparen6+5\\rparen',
        Ex0Q6: '-13x-3',
      },
      numberOfPoints: 4,
      numberOfQuestions: 7,
      bestScore: 4,
    },
  ],
}

rpc.expose('toolGetActivityParams', () => activityParams)

rpc.expose('hasChanged', () => console.log('hasChanged'))

rpc.expose('saveStudentAssignment', (data) => {
  console.log('saveStudentAssignment', data)
  window.localStorage.setItem('saveStudentAssignment', JSON.stringify(data))
  return Promise.resolve()
})
