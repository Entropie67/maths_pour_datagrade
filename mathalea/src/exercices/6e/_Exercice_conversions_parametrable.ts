import Decimal from 'decimal.js'
import { texTexte } from '../../lib/format/texTexte'
import {
  lireFormulaireComplexe,
  repartitionPonderee,
  repartitionPondereeOrdonnee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  getRandomSubarray,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Conversions de longueurs, masses, contenances, prix et unités informatiques,
 * paramétrées par un formulaire complexe (`besoinFormulaireComplexe`).
 *
 * Contrairement à `_Exercice_conversions.ts`, dont le niveau de difficulté est un
 * unique menu déroulant énumérant les combinaisons prévues, l'enseignant choisit ici
 * indépendamment :
 *
 * * les unités travaillées, leur ordre et leur poids d'apparition ;
 * * le type d'opérations (multiplications, divisions ou tous types de conversions,
 *   y compris celles ne passant pas par l'unité de référence, ex. de déca à milli) ;
 * * la présence de nombres décimaux ;
 * * la façon de corriger les divisions (divisions, fractions ou multiplications par
 *   0,1 ; 0,01…).
 *
 * @author Rémi Angot
 */

type Prefixe = {
  symbole: string
  facteur: number
  nom: string
  /** Début de la phrase de correction, complété par « de » ou « d' » puis l'unité. */
  explication: string
}

const prefixesMultiplicateurs: Record<string, Prefixe> = {
  da: { symbole: 'da', facteur: 10, nom: 'déca', explication: 'une dizaine' },
  h: { symbole: 'h', facteur: 100, nom: 'hecto', explication: 'une centaine' },
  k: { symbole: 'k', facteur: 1000, nom: 'kilo', explication: 'un millier' },
}

const prefixesDiviseurs: Record<string, Prefixe> = {
  d: { symbole: 'd', facteur: 10, nom: 'déci', explication: 'un dixième' },
  c: { symbole: 'c', facteur: 100, nom: 'centi', explication: 'un centième' },
  m: { symbole: 'm', facteur: 1000, nom: 'milli', explication: 'un millième' },
}

type DefinitionUnite = {
  symbole: string
  singulier: string
  pluriel: string
  /** Préfixes multiplicateurs utilisables avec cette unité (`kL` n'est pas usuel). */
  multiplicateurs: string[]
  /** Préfixes diviseurs utilisables avec cette unité (il n'y a pas de `d€`). */
  diviseurs: string[]
  /**
   * Nom de l'unité préfixée dans la correction. Par défaut, le nom du préfixe est
   * accolé au singulier (« kilogramme ») ; l'euro fait exception (« k€ »).
   */
  nomPrefixe?: (prefixe: Prefixe) => string
  /** `true` si l'unité s'élide : « un millier d'euros » et non « de euros ». */
  elision?: boolean
}

/** Unités décimales classiques, hors unités de stockage informatique. */
const definitionsUnites: Record<string, DefinitionUnite> = {
  m: {
    symbole: 'm',
    singulier: 'mètre',
    pluriel: 'mètres',
    multiplicateurs: ['da', 'h', 'k'],
    diviseurs: ['d', 'c', 'm'],
  },
  L: {
    symbole: 'L',
    singulier: 'litre',
    pluriel: 'litres',
    multiplicateurs: ['da', 'h'],
    diviseurs: ['d', 'c', 'm'],
  },
  g: {
    symbole: 'g',
    singulier: 'gramme',
    pluriel: 'grammes',
    multiplicateurs: ['da', 'h', 'k'],
    diviseurs: ['d', 'c', 'm'],
  },
  euro: {
    symbole: '€',
    singulier: 'euro',
    pluriel: 'euros',
    multiplicateurs: ['k'],
    diviseurs: [],
    nomPrefixe: (prefixe) => `${prefixe.symbole}€`,
    elision: true,
  },
}

/** Type de conversion tiré pour une question, utilisé par le mode « Tous types de conversions ». */
type TypeConversion = 'multRef' | 'divRef' | 'multSansRef' | 'divSansRef'

/**
 * Préfixe disponible pour une unité, avec son exposant par rapport à l'unité de
 * référence (`+1` pour « da », `-3` pour « milli »…). Un exposant entier, plutôt qu'un
 * facteur ou une échelle décimale, évite toute imprécision en virgule flottante quand on
 * compare ou combine deux préfixes.
 */
type EchellePrefixe = { symbole: string; exposant: number }

/**
 * Préfixes utilisables pour une unité (multiplicateurs et diviseurs confondus). Sert aux
 * conversions « sans l'unité de référence » (ex. de déca à milli).
 */
function echellesDisponibles(definition: DefinitionUnite): EchellePrefixe[] {
  return [
    ...definition.multiplicateurs.map((symbole) => ({
      symbole,
      exposant: Math.round(
        Math.log10(prefixesMultiplicateurs[symbole].facteur),
      ),
    })),
    ...definition.diviseurs.map((symbole) => ({
      symbole,
      exposant: -Math.round(Math.log10(prefixesDiviseurs[symbole].facteur)),
    })),
  ]
}

/**
 * Étape intermédiaire de la correction d'une division, selon le mode choisi par
 * l'enseignant : `6,74 dm = 6,74\div10 m`, `6,74 dm = \dfrac{6,74}{10} m` (uniquement pour
 * un numérateur entier) ou `6,74 dm = 6,74\times0,1 m`.
 */
function etapeDivision(
  valeur: Decimal,
  decimalesValeur: number,
  facteur: number,
  mode: string,
): string {
  if (mode === 'frac' && valeur.isInteger()) {
    return fraction(valeur.toNumber(), facteur).texFraction
  }
  if (mode === 'mult') {
    const decimalesInverse = String(facteur).length - 1
    return `${texNombre(valeur, decimalesValeur)}\\times${texNombre(new Decimal(1).div(facteur), decimalesInverse)}`
  }
  return `${texNombre(valeur, decimalesValeur)}\\div${texNombre(facteur, 0)}`
}

/**
 * Phrase d'explication du préfixe : « Un kilogramme est un millier de grammes ».
 */
function phraseExplication(
  definition: DefinitionUnite,
  prefixe: Prefixe,
  division: boolean,
): string {
  const nomPrefixe =
    definition.nomPrefixe?.(prefixe) ?? `${prefixe.nom}${definition.singulier}`
  const complement = division ? definition.singulier : definition.pluriel
  const liaison = definition.elision ? 'd’' : 'de '
  return `Un ${nomPrefixe} est ${prefixe.explication} ${liaison}${complement}`
}

/** Unités de masse supérieures au kilogramme, utilisées avec le kilogramme comme référence. */
type UniteMasseLourde = {
  symbole: string
  singulier: string
  pluriel: string
  article: string
  /** Nombre de kilogrammes dans l'unité. */
  kilogrammes: number
}

const quintal: UniteMasseLourde = {
  symbole: 'q',
  singulier: 'quintal',
  pluriel: 'quintaux',
  article: 'Un',
  kilogrammes: 100,
}
const tonne: UniteMasseLourde = {
  symbole: 't',
  singulier: 'tonne',
  pluriel: 'tonnes',
  article: 'Une',
  kilogrammes: 1000,
}

/** Façon de dire « 1 / facteur » dans la correction d'une division. */
const fractionEnToutesLettres: Record<number, string> = {
  10: 'un dixième',
  100: 'un centième',
  1000: 'un millième',
}

/**
 * Conversion de masses faisant intervenir le quintal et la tonne, avec le kilogramme
 * comme unité de référence : `3 t = 3 000 kg`, `450 kg = 4,5 q` ou `7 q = 0,7 t`.
 *
 * Contrairement aux préfixes usuels, le quintal et la tonne sont plus grands que
 * l'unité de référence : les « multiplications vers la référence » vont donc de q ou t
 * vers kg, et les « divisions » de kg vers q ou t.
 */
function conversionMassesLourdes(typeConversion: TypeConversion): {
  division: boolean
  uniteDepart: string
  uniteArrivee: string
  facteur: number
  phrase: string
} {
  const division =
    typeConversion === 'divRef' || typeConversion === 'divSansRef'
  const sansReference =
    typeConversion === 'multSansRef' || typeConversion === 'divSansRef'
  // `grande` est l'unité qui vaut `facteur` fois la `petite`.
  const grande = sansReference ? tonne : choice([quintal, tonne])
  const petite = sansReference
    ? quintal
    : {
        symbole: 'kg',
        singulier: 'kilogramme',
        pluriel: 'kilogrammes',
        article: 'Un',
        kilogrammes: 1,
      }
  const facteur = grande.kilogrammes / petite.kilogrammes
  const phrase = division
    ? `${petite.article} ${petite.singulier} est ${fractionEnToutesLettres[facteur]} de ${grande.singulier}`
    : `${grande.article} ${grande.singulier} est égal${grande.article === 'Une' ? 'e' : ''} à ${texNombre(facteur, 0)} ${petite.pluriel}`
  return {
    division,
    uniteDepart: division ? petite.symbole : grande.symbole,
    uniteArrivee: division ? grande.symbole : petite.symbole,
    facteur,
    phrase,
  }
}

/** Unités de stockage informatique, séparées de 1 000 en 1 000. */
const unitesInformatiques = ['o', 'ko', 'Mo', 'Go', 'To']

/**
 * Formulaire de paramétrage partagé par tous les exercices utilisant cette classe.
 */
export const formulaireConversions: FormulaireComplexe = {
  champs: [
    {
      type: 'selection',
      nom: 'operations',
      label: 'Type d’opérations',
      options: [
        { valeur: 'mult', label: "Multiplications (da, h, k) vers l'unité de référence" },
        { valeur: 'div', label: "Divisions (d, c, m) vers l'unité de référence" },
        { valeur: 'tous', label: 'Tous types de conversions' },
      ],
      defaut: 'mult',
    },

    {
      type: 'listePondereeOrdonnee',
      nom: 'unites',
      label: 'Unités (poids d’apparition)',
      labelOrdre: 'Respecter l’ordre des unités',
      items: [
        { nom: 'm', label: 'Longueurs (m)', poids: 1 },
        { nom: 'L', label: 'Contenances (L)', poids: 1 },
        { nom: 'g', label: 'Masses (g)', poids: 1 },
        { nom: 'euro', label: 'Prix (€)', poids: 0 },
        { nom: 'octet', label: 'Stockage informatique (o)', poids: 0 },
        { nom: 'masseLourde', label: 'Masses (kg, quintal, tonne)', poids: 0 },
      ],
    },

    {
      type: 'case',
      nom: 'decimaux',
      label: 'Avec des nombres décimaux',
      defaut: false,
    },
    {
      type: 'selection',
      nom: 'correctionDivision',
      label: 'Type de correction pour les divisions',
      options: [
        { valeur: 'div', label: 'Divisions' },
        { valeur: 'frac', label: 'Fractions' },
        { valeur: 'mult', label: 'Multiplications (par 0,1 ; 0,01…)' },
      ],
      defaut: 'div',
    },
  ],
}

/** Valeur de `this.sup` correspondant aux réglages par défaut du formulaire. */
export const supParDefaut = serialiseFormulaireComplexe(
  formulaireConversions,
  valeursParDefaut(formulaireConversions),
)

/** Nombre à convertir : entier « rond » ou décimal simple. */
function valeurADistribuer(avecDecimaux: boolean): Decimal {
  if (avecDecimaux) {
    // XX,X puis 0,X puis 0,0X puis X,XX
    return choice([
      new Decimal(randint(1, 9)).div(10).add(randint(1, 19)),
      new Decimal(randint(1, 9)).div(10),
      new Decimal(randint(1, 9)).div(100),
      new Decimal(randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9)).div(
        100,
      ),
    ])
  }
  // X puis X0 puis X00 puis XX
  return new Decimal(
    choice([
      randint(1, 9),
      randint(1, 9) * 10,
      randint(1, 9) * 100,
      randint(1, 9) * 10 + randint(1, 9),
    ]),
  )
}

export default class ExerciceConversionsParametrable extends Exercice {
  constructor() {
    super()
    this.titre =
      'Convertir des longueurs, masses, contenances, prix ou unités informatiques'
    this.consigne = 'Compléter.'
    this.spacing = 2
    this.nbQuestions = 5
    this.besoinFormulaireComplexe = formulaireConversions
    this.sup = supParDefaut
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  /**
   * Écrit l'énoncé « valeur unité de départ = … unité d'arrivée », avec un champ de
   * saisie en HTML interactif et des pointillés sinon.
   */
  private enonce(
    i: number,
    valeur: Decimal,
    decimalesValeur: number,
    uniteDepart: string,
    uniteArrivee: string,
  ): string {
    const debut = `$ ${texNombre(valeur, decimalesValeur)}${texTexte(uniteDepart)} = `
    if (this.interactif && context.isHtml) {
      return `${debut}$ ${ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierNumbers,
        { texteApres: '$' + texTexte(uniteArrivee) + '$' },
      )}`
    }
    return `${debut}\\dotfill ${texTexte(uniteArrivee)}$`
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaireConversions, this.sup)
    const avecDecimaux = params.case('decimaux')
    const modeDivision = params.selection('correctionDivision')
    const operations = params.selection('operations')

    // Une unité n'est retenue que si elle possède des préfixes compatibles avec le
    // type d'opérations choisi (il n'existe pas de sous-multiple usuel de l'euro).
    const estCompatible = (nom: string) => {
      if (nom === 'octet' || nom === 'masseLourde') return true
      const definition = definitionsUnites[nom]
      if (definition === undefined) return false
      if (operations === 'mult') return definition.multiplicateurs.length > 0
      if (operations === 'div') return definition.diviseurs.length > 0
      return (
        definition.multiplicateurs.length > 0 || definition.diviseurs.length > 0
      )
    }

    // Les unités incompatibles sont écartées avant la répartition ; celles déclarées
    // par le formulaire servent de repli si l'enseignant a tout décoché.
    const unitesRetenues = params
      .liste('unites')
      .filter((item) => estCompatible(item.nom))
    const unitesDeReference = params
      .declares('unites')
      .filter((item) => estCompatible(item.nom))
    const repartition = params.ordreImpose('unites')
      ? repartitionPondereeOrdonnee
      : repartitionPonderee
    const unitesParQuestion = repartition(
      unitesRetenues,
      this.nbQuestions,
      unitesDeReference,
    )

    // En mode « Tous types de conversions », les 4 types alternent de manière équitable
    // (répartition proche de l'équirépartition sur l'ensemble des questions).
    const typesTousParQuestion: TypeConversion[] =
      operations === 'tous'
        ? combinaisonListes(
            ['multRef', 'divRef', 'multSansRef', 'divSansRef'] as TypeConversion[],
            this.nbQuestions,
          )
        : []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const nomUnite = unitesParQuestion[i]
      if (nomUnite === undefined) break
      const typeConversion: TypeConversion =
        operations === 'mult'
          ? 'multRef'
          : operations === 'div'
            ? 'divRef'
            : typesTousParQuestion[i]

      let texte: string
      let texteCorr: string
      let resultat: Decimal
      let valeur: Decimal

      if (nomUnite === 'octet') {
        const division =
          typeConversion === 'divRef' || typeConversion === 'divSansRef'
        // Nombre de multiplications par 1 000 : on s'en tient à un seul palier pour
        // les divisions, sinon les nombres de départ deviennent illisibles.
        const ecart = division ? 1 : randint(1, 2)
        const indiceGrand = randint(ecart, unitesInformatiques.length - 1)
        const indicePetit = indiceGrand - ecart
        const facteur = new Decimal(1000).pow(ecart)
        const nombreDeBase = valeurADistribuer(avecDecimaux)
        const decimalesBase = nombreDeBase.decimalPlaces()
        if (division) {
          // Ex. : 3 000 ko = 3 Mo
          valeur = nombreDeBase.mul(facteur)
          resultat = nombreDeBase
          const uniteDepart = unitesInformatiques[indicePetit]
          const uniteArrivee = unitesInformatiques[indiceGrand]
          texte = this.enonce(i, valeur, 0, uniteDepart, uniteArrivee)
          texteCorr =
            `$ ${texNombre(valeur, 0)}${texTexte(uniteDepart)} = ` +
            `${texNombre(valeur, 0)}\\div${texNombre(facteur, 0)}${texTexte(uniteArrivee)} = ` +
            `${miseEnEvidence(texNombre(resultat, decimalesBase))}${texTexte(uniteArrivee)}$`
        } else {
          // Ex. : 3 Mo = 3 000 ko
          valeur = nombreDeBase
          resultat = nombreDeBase.mul(facteur)
          const uniteDepart = unitesInformatiques[indiceGrand]
          const uniteArrivee = unitesInformatiques[indicePetit]
          texte = this.enonce(
            i,
            valeur,
            decimalesBase,
            uniteDepart,
            uniteArrivee,
          )
          texteCorr =
            `$ ${texNombre(valeur, decimalesBase)}${texTexte(uniteDepart)} = ` +
            `${texNombre(valeur, decimalesBase)}\\times${texNombre(facteur, 0)}${texTexte(uniteArrivee)} = ` +
            `${miseEnEvidence(texNombre(resultat, 0))}${texTexte(uniteArrivee)}$`
        }
      } else {
        const definition = definitionsUnites[nomUnite]

        // « Sans l'unité de référence » : conversion directe entre deux préfixes non
        // triviaux (ex. de déca à milli), sans passer par l'unité de base. Repli vers
        // une conversion classique si l'unité n'a pas au moins deux préfixes utilisables
        // (l'euro, qui n'a que « k », ne peut par exemple pas en bénéficier).
        const echelles =
          nomUnite !== 'masseLourde' &&
          (typeConversion === 'multSansRef' || typeConversion === 'divSansRef')
            ? echellesDisponibles(definition)
            : []
        const sansReference = echelles.length >= 2

        let division: boolean
        let uniteDepart: string
        let uniteArrivee: string
        let facteurMultiplication: number | undefined
        let facteurDivision: number | undefined
        let phraseExplicative: string | undefined

        if (nomUnite === 'masseLourde') {
          const conversion = conversionMassesLourdes(typeConversion)
          division = conversion.division
          uniteDepart = conversion.uniteDepart
          uniteArrivee = conversion.uniteArrivee
          if (division) facteurDivision = conversion.facteur
          else facteurMultiplication = conversion.facteur
          phraseExplicative = conversion.phrase
        } else if (sansReference) {
          const veutMultiplication = typeConversion === 'multSansRef'
          const [a, b] = getRandomSubarray(echelles, 2)
          const [depart, arrivee] =
            a.exposant > b.exposant === veutMultiplication ? [a, b] : [b, a]
          division = !veutMultiplication
          uniteDepart = depart.symbole + definition.symbole
          uniteArrivee = arrivee.symbole + definition.symbole
          const facteur = Math.pow(10, Math.abs(depart.exposant - arrivee.exposant))
          if (veutMultiplication) {
            facteurMultiplication = facteur
          } else {
            facteurDivision = facteur
          }
        } else {
          division =
            typeConversion === 'divRef' || typeConversion === 'divSansRef'
          // Le sens tiré peut être impossible pour l'unité (l'euro n'a pas de
          // sous-multiple usuel) : on se rabat sur l'autre sens plutôt que de tenter
          // en vain une combinaison qui restera toujours indisponible.
          if ((division ? definition.diviseurs : definition.multiplicateurs).length === 0) {
            division = !division
          }
          const symbolesPossibles = division
            ? definition.diviseurs
            : definition.multiplicateurs
          if (symbolesPossibles.length === 0) continue
          const prefixeVersReference = division
            ? prefixesDiviseurs[choice(symbolesPossibles)]
            : prefixesMultiplicateurs[choice(symbolesPossibles)]
          uniteDepart = prefixeVersReference.symbole + definition.symbole
          uniteArrivee = definition.symbole
          if (division) facteurDivision = prefixeVersReference.facteur
          else facteurMultiplication = prefixeVersReference.facteur
          phraseExplicative = phraseExplication(
            definition,
            prefixeVersReference,
            division,
          )
        }

        valeur = valeurADistribuer(avecDecimaux)
        const decimalesValeur = valeur.decimalPlaces()
        resultat = division
          ? valeur.div(facteurDivision as number)
          : valeur.mul(facteurMultiplication as number)
        const decimalesResultat = resultat.decimalPlaces()
        texte = this.enonce(i, valeur, decimalesValeur, uniteDepart, uniteArrivee)
        const etapeIntermediaire = division
          ? etapeDivision(
              valeur,
              decimalesValeur,
              facteurDivision as number,
              modeDivision,
            )
          : `${texNombre(valeur, decimalesValeur)}\\times${texNombre(facteurMultiplication as number, 0)}`
        texteCorr =
          `$ ${texNombre(valeur, decimalesValeur)}${texTexte(uniteDepart)} = ` +
          `${etapeIntermediaire}${texTexte(uniteArrivee)} = ` +
          `${miseEnEvidence(texNombre(resultat, decimalesResultat))}${texTexte(uniteArrivee)}$`
        if (this.correctionDetaillee && phraseExplicative !== undefined) {
          texteCorr = `${phraseExplicative} donc :<br>${texteCorr}`
        }
      }

      if (this.questionJamaisPosee(i, nomUnite, texte)) {
        handleAnswers(this, i, {
          reponse: {
            value: resultat.toString(),
            options: { nombreDecimalSeulement: true, fractionDecimale: true },
          },
        })
        if (context.vue === 'diap') {
          texte = texte.replace('= \\dotfill', '\\text{ en }')
        }
        if (context.isHtml) {
          texte = texte.replace(
            '\\dotfill',
            '\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots',
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
