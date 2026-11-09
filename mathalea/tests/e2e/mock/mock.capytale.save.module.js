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

const activityParamsStr =
  '{"mode":"assignment","workflow":"current","activity":{"exercicesParams":[{"uuid":"51242","id":"canc3D04","interactif":"1","alea":"stG6"},{"uuid":"6225c","id":"6M23","interactif":"1","sup3":"1","alea":"Qlfa"},{"uuid":"6225c","id":"6M23","interactif":"1","nbQuestions":1,"duration":10,"sup":"3","sup2":"false","sup3":"2","sup4":"false","cd":"1","alea":"4JMh"},{"uuid":"f8dee","id":"6G2B","interactif":"1","alea":"XEP0"},{"uuid":"83763","id":"6G10-3","interactif":"1","nbQuestions":2,"duration":10,"cd":"1","alea":"AJha"},{"uuid":"e6f62","id":"6C13-2","interactif":"1","alea":"fdfj"},{"uuid":"0688e","id":"6N10","interactif":"1","nbQuestions":1,"duration":10,"sup":"4","sup2":"0","sup3":"1","sup4":"true","cd":"1","alea":"gFXm"},{"uuid":"1acf7","id":"6N2autoB-1","interactif":"1","nbQuestions":2,"duration":10,"sup":"4-1","cd":"1","alea":"cAp1"}],"globalOptions":{"v":"","z":"1","durationGlobal":0,"nbVues":1,"flow":0,"isImagesOnSides":false,"sound":0,"shuffle":false,"select":[],"order":[],"title":"","presMode":"un_exo_par_page","setInteractive":"2","isSolutionAccessible":true,"isInteractiveFree":true,"oneShot":false,"twoColumns":false,"isTitleDisplayed":true,"recorder":"capytale","beta":false,"iframe":"","answers":""},"canOptions":{"durationInMinutes":540,"subTitle":"","isChoosen":false,"solutionsAccess":true,"solutionsMode":"gathered","isInteractive":true,"remainingTimeInSeconds":0,"questionGetAnswer":[],"state":"start"}}}'
const activityParams = JSON.parse(activityParamsStr)
rpc.expose('toolGetActivityParams', () => activityParams)

rpc.expose('hasChanged', () => console.log('hasChanged'))

rpc.expose('saveStudentAssignment', (data) => {
  console.log('saveStudentAssignment', data)
  window.localStorage.setItem('saveStudentAssignment', JSON.stringify(data))
  return Promise.resolve()
})
