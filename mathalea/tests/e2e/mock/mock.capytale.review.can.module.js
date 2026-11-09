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
  mode: 'review',
  workflow: 'current',
  activity: {
    exercicesParams: [
      {
        uuid: '51242',
        id: 'canc3D04',
        interactif: '1',
        alea: 'stG6',
      },
      {
        uuid: '6225c',
        id: '6M23',
        interactif: '1',
        // QCM : le type de réponse par défaut est devenu numérique
        sup3: '1',
        alea: 'Qlfa',
      },
      {
        uuid: '6225c',
        id: '6M23',
        interactif: '1',
        nbQuestions: 1,
        duration: 10,
        sup: '3',
        sup2: 'false',
        sup3: '2',
        sup4: 'false',
        cd: '1',
        alea: '4JMh',
      },
      {
        uuid: 'f8dee',
        id: '6G2B',
        interactif: '1',
        alea: 'XEP0',
      },
      {
        uuid: '83763',
        id: '6G10-3',
        interactif: '1',
        nbQuestions: 2,
        duration: 10,
        cd: '1',
        alea: 'AJha',
      },
      {
        uuid: 'e6f62',
        id: '6C13-2',
        interactif: '1',
        alea: 'fdfj',
      },
      {
        uuid: '0688e',
        id: '6N10',
        interactif: '1',
        nbQuestions: 1,
        duration: 10,
        sup: '4',
        sup2: '0',
        sup3: '1',
        sup4: 'true',
        cd: '1',
        alea: 'gFXm',
      },
    ],
    globalOptions: {
      v: '',
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
      presMode: 'liste_exos',
      setInteractive: '1',
      isSolutionAccessible: true,
      isInteractiveFree: true,
      oneShot: false,
      twoColumns: false,
      isTitleDisplayed: true,
      recorder: 'capytale',
      beta: false,
      iframe: '',
      isDataRandom: false, // ajouter pour ne pas changer les données
      answers: '',
    },
    canOptions: {
      durationInMinutes: 540,
      subTitle: '',
      isChoosen: true,
      solutionsAccess: true,
      solutionsMode: 'gathered',
      isInteractive: true,
      remainingTimeInSeconds: 0,
      questionGetAnswer: [],
      state: 'start',
    },
  },
  studentAssignment: [
    {
      uuid: '51242',
      title: "Indiquer l'heure sur une horloge",
      indice: 0,
      state: 'done',
      alea: 'stG6',
      answers: {
        'interactive-clockEx0Q0': '{"hour":12,"minute":15,"second":0}',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: '6225c',
      title: 'Convertir des aires',
      indice: 1,
      state: 'done',
      alea: 'Qlfa',
      answers: {
        Ex1Q0R0: '1',
        Ex1Q0R1: '0',
        Ex1Q0R2: '0',
        Ex1Q0R3: '0',
        Ex1Q0R4: '0',
        Ex1Q0: '$20\\,000\\,000\\,000$',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: '6225c',
      title: 'Convertir des aires',
      indice: 2,
      state: 'done',
      alea: '4JMh',
      answers: {
        Ex2Q0: '600',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: 'f8dee',
      title: 'Utiliser la définition du cercle et du disque',
      indice: 3,
      state: 'done',
      alea: 'XEP0',
      answers: {
        apigeomEx3F06GXX0:
          '{\n  "apiGeomVersion": "3.0.20230508",\n  "options": {\n    "animationStepInterval": 3000,\n    "automaticUserMessage": true,\n    "borderSize": 0.2,\n    "color": "currentColor",\n    "colorPointPolygon": "none",\n    "changeColorChangeActionToSetOptions": true,\n    "discFillOpacity": 0.2,\n    "displayGrid": false,\n    "distanceWithoutNewPoint": 0.2,\n    "fillColor": "none",\n    "fillColorAndBorderColorAreSame": true,\n    "fillOpacity": 0.2,\n    "gridWithTwoPointsOnSamePosition": true,\n    "fontSize": "1em",\n    "isDashed": false,\n    "labelDxInPixels": 15,\n    "labelDyInPixels": 15,\n    "latexHeight": 12,\n    "labelIsVisible": true,\n    "latexWidth": 18,\n    "limitNumberOfElement": {},\n    "mark": "||",\n    "moveTextGrid": 15,\n    "pointDescriptionWithCoordinates": true,\n    "pointSize": 5,\n    "thickness": 1,\n    "shape": "x",\n    "shapeForPolygon": "x",\n    "thicknessForPoint": 2,\n    "tmpColor": "gray",\n    "tmpFillColor": "rgba(241, 89, 41, 0.5)",\n    "tmpFillOpacity": 0.2,\n    "tmpIsDashed": true,\n    "tmpThickness": 1,\n    "tmpShape": "x"\n  },\n  "point1": {\n    "color": "currentColor",\n    "id": "point1",\n    "isDashed": false,\n    "isVisible": true,\n    "isSelectable": true,\n    "isDeletable": false,\n    "opacity": 1,\n    "thickness": 2,\n    "type": "Point",\n    "colorLabel": "currentColor",\n    "label": "B",\n    "labelDxInPixels": 10,\n    "labelDyInPixels": 20,\n    "shape": "x",\n    "sizeInPixels": 5,\n    "x": 1,\n    "y": 2\n  },\n  "point2": {\n    "color": "currentColor",\n    "id": "point2",\n    "isDashed": false,\n    "isVisible": true,\n    "isSelectable": true,\n    "isDeletable": false,\n    "opacity": 1,\n    "thickness": 2,\n    "type": "Point",\n    "colorLabel": "currentColor",\n    "label": "S",\n    "labelDxInPixels": 10,\n    "labelDyInPixels": 20,\n    "shape": "x",\n    "sizeInPixels": 5,\n    "x": -3,\n    "y": 2\n  },\n  "element0": {\n    "color": "currentColor",\n    "id": "element0",\n    "isDashed": false,\n    "isVisible": true,\n    "isSelectable": true,\n    "isDeletable": true,\n    "opacity": 1,\n    "thickness": 1,\n    "type": "Circle",\n    "fillColor": "currentColor",\n    "fillOpacity": 0.2,\n    "idCenter": "point1",\n    "radius": "5"\n  }\n}',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: '83763',
      title: 'Choisir la bonne figure',
      indice: 4,
      state: 'done',
      alea: 'AJha',
      answers: {
        cliquefigure2Ex4Q0: '1',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: '83763',
      title: 'Choisir la bonne figure',
      indice: 4,
      state: 'done',
      alea: 'AJha',
      answers: {
        cliquefigure0Ex4Q1: '1',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: 'e6f62',
      title: 'Traduire une expression par une phrase',
      indice: 5,
      state: 'done',
      alea: 'fdfj',
      answers: {
        'liste-deroulanteEx5Q0': 'différence',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: 'e6f62',
      title: 'Traduire une expression par une phrase',
      indice: 5,
      state: 'done',
      alea: 'fdfj',
      answers: {
        'liste-deroulanteEx5Q1': 'différence',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: 'e6f62',
      title: 'Traduire une expression par une phrase',
      indice: 5,
      state: 'done',
      alea: 'fdfj',
      answers: {
        'liste-deroulanteEx5Q2': 'différence',
      },
      numberOfPoints: 1,
      numberOfQuestions: 1,
      bestScore: 1,
      resultsByQuestion: [true],
      duration: 7,
    },
    {
      uuid: 'e6f62',
      title: 'Traduire une expression par une phrase',
      indice: 5,
      state: 'done',
      alea: 'fdfj',
      answers: {
        'liste-deroulanteEx5Q3': 'différence',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
    {
      uuid: '0688e',
      title: 'Écrire un nombre entier en chiffres ou en lettres',
      indice: 6,
      state: 'done',
      alea: 'gFXm',
      answers: {
        rectangleDNDEx6Q0R1: 'etiquetteEx6Q0I20-clone-1741036911757',
        texteDNDEx6Q0R1: 'deux',
        Ex6Q0: 'deux',
      },
      numberOfPoints: 0,
      numberOfQuestions: 1,
      bestScore: 0,
      resultsByQuestion: [false],
      duration: 7,
    },
  ],
  evaluation: '1',
  exerciceGraded: 'all',
  assignmentData: {
    duration: 7,
    resultsByQuestion: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
    ],
  },
  final: false,
}

rpc.expose('toolGetActivityParams', () => activityParams)

rpc.expose('hasChanged', () => console.log('hasChanged'))

rpc.expose('saveStudentAssignment', (data) => {
  console.log('saveStudentAssignment', data)
  window.localStorage.setItem('saveStudentAssignment', JSON.stringify(data))
  return Promise.resolve()
})
