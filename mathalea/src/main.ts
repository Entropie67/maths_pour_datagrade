import 'boxicons/css/boxicons.min.css'
import './app.css'
import { mount } from 'svelte'
import App from './components/App.svelte'
import './bugsnag'
import './modules/stats'
import {
  chargerBanquesDepuisUrl,
  chargerBanquesInstallees,
  chargerBanquesIntegrees,
} from './lib/stores/banquesExternesStore'

/**
 * Délai au-delà duquel on démarre sans attendre les banques externes : une
 * forge injoignable ne doit pas retenir l'application.
 */
const DELAI_MAX_BANQUES = 8000

/**
 * Charge les banques d'exercices externes **avant** le premier rendu : les vues
 * (menu latéral, A4, Typst, LaTeX) résolvent les uuid `bq-…` à leur montage et
 * ne referaient pas ce travail à l'arrivée tardive d'un manifest. Sans banque
 * installée ni paramètre `bq` dans l'URL, l'opération est immédiate.
 *
 * Les banques livrées avec le site (FFJM…) sont chargées en premier : elles
 * sont visibles par tout le monde et doivent apparaître en tête de « Ressources
 * partenaires », avant les banques ajoutées par l'utilisateur.
 * @returns {Promise<void>} résolue quand les banques sont prêtes (ou le délai écoulé)
 */
async function chargerBanquesExternes(): Promise<void> {
  const chargement = chargerBanquesIntegrees()
    .then(() => chargerBanquesInstallees())
    .then(() => chargerBanquesDepuisUrl())
  const delai = new Promise((resolve) => setTimeout(resolve, DELAI_MAX_BANQUES))
  try {
    await Promise.race([chargement, delai])
  } catch (erreur) {
    console.error('Chargement des banques externes', erreur)
  }
}

const app = chargerBanquesExternes().then(() =>
  mount(App, {
    target: document.getElementById('appMathalea') as HTMLElement,
  }),
)

export default app
