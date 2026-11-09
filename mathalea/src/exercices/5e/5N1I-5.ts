import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  "Dire si la solution d'un problème est un diviseur ou un multiple"

export const dateDePublication = '17/05/2026'
export const uuid = '2173b'
export const refs = {
  'fr-fr': ['5N1I-5'],
  'fr-2016': ['5A10-4'],
  'fr-ch': ['9R1NO1A-5', '9R2NO1A-5', '9R3NO1A-5', 'PRQNO09A-5'],
}
/**
 * @author Éric Elter
 */

/**
 * Contracte "de" avec un groupe nominal français simple.
 *
 * Transforme automatiquement :
 * - "le ..."  → "du ..."
 * - "la ..."  → "de la ..."
 * - "les ..." → "des ..."
 * - voyelle ou h muet → "de l'..."
 * - sinon → "de ..."
 *
 * @param texte - Groupe nominal (ex: "le nombre", "la folie", "arbre")
 * @returns Le groupe nominal précédé de "de" correctement contracté
 * @author Éric Elter (sur un prompt d'IA)
 *
 * @example
 * contracterDe('le nombre')   // "du nombre"
 * contracterDe('la folie')    // "de la folie"
 * contracterDe('les arbres')  // "des arbres"
 * contracterDe('arbre')       // "de l'arbre"
 * contracterDe('homme')       // "de l'homme"
 *
 * @remarks
 * Cette fonction simplifie la gestion du "h" en considérant tous les mots
 * commençant par "h" comme ayant un *h muet* (→ "de l'").
 *
 * En français, certains mots ont un *h aspiré* (ex : "héros", "haricot"),
 * pour lesquels on ne fait PAS l’élision :
 *   - "le héros" → "du héros" (et non "de l'héros")
 *
 * Pour un traitement parfaitement correct, il faudrait utiliser une liste
 * de mots à "h aspiré".
 */

function contracterDe(texte: string): string {
  const mots = texte.trim().split(/\s+/)

  if (mots.length === 0) return texte

  const premierMot = mots[0].toLowerCase()

  // Cas particuliers
  if (premierMot === 'le') {
    mots[0] = 'du'
  } else if (premierMot === 'la') {
    mots[0] = 'de la'
  } else if (premierMot === 'les') {
    mots[0] = 'des'
  } else if (/^[aeiouhâêîôûéèëïüœ]/i.test(premierMot)) {
    // voyelle ou h muet → de l'
    mots[0] = `de l'${mots[0].slice(0)}`
    return mots.join(' ').replace("de l'", "de l'")
  } else {
    // fallback
    mots.unshift('de')
    return mots.join(' ')
  }

  return mots.join(' ')
}

function majusculeInitiale(texte: string): string {
  return texte[0].toUpperCase() + texte.slice(1)
}

export default class MultiplesOuDiviseurs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 1.2
    this.spacingCorr = 1.2
    this.besoinFormulaireTexte = [
      'Thèmes des problèmes',
      [
        'Nombres séparés par des tirets  :',
        '1 : Salle de spectacle',
        '2 : Distribution de bonbons',
        "3 : Plantation d'arbres",
        '4 : Mise en boîtes de chocolats',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1'

    this.besoinFormulaire2Numerique = [
      'Type de résultats à trouver',
      3,
      ['1 : Diviseurs', '2 : Multiples', '3 : Mélange'].join('\n'),
    ]
    this.sup2 = 3

    this.besoinFormulaire3CaseACocher = ['Autoriser ni diviseur, ni multiple']
    this.sup3 = false

    this.besoinFormulaire4Numerique = [
      'Vocabulaire à employer dans le QCM',
      5,
      [
        '1 : Diviseurs',
        '2 : Multiples',
        '3 : En adéquation avec le type de résultats à trouver',
        '4 : En inadéquation avec le type de résultats à trouver',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup4 = 3

    this.comment =
      "Le type de résultats à trouver permet de savoir si la solution de la seconde question est un multiple ou un diviseur d'une donnée de la consigne.<br>"
    this.comment +=
      "La case à cocher permet d'autoriser que la solution ne soit possiblement, ni un multiple, ni un diviseur d'une donnée de la consigne.<br>"
    this.comment +=
      'Le dernier paramètre permet de choisir le vocabulaire utilisé dans le QCM de la première question.'
  }

  nouvelleVersion() {
    const typesDeProblemesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeProblemes = combinaisonListes(
      typesDeProblemesDisponibles,
      this.nbQuestions,
    )

    const typesDeResultatsDisponibles =
      this.sup2 === 1
        ? ['Diviseur']
        : this.sup2 === 2
          ? ['Multiple']
          : ['Diviseur', 'Multiple']

    const typesDeResultats = combinaisonListes(
      typesDeResultatsDisponibles,
      this.nbQuestions,
    )
    const typesDeResultatsContraires = typesDeResultats.map((t) =>
      t === 'Diviseur' ? 'Multiple' : 'Diviseur',
    )

    let typesDeVocabulaire =
      this.sup4 === 1
        ? ['Diviseur']
        : this.sup4 === 2
          ? ['Multiple']
          : this.sup4 === 3
            ? typesDeResultats
            : this.sup4 === 4
              ? typesDeResultatsContraires
              : ['Diviseur', 'Multiple']

    if (this.sup4 !== 3 && this.sup4 !== 4)
      typesDeVocabulaire = combinaisonListes(
        typesDeVocabulaire,
        this.nbQuestions,
      )
    const NiLUnNiLautre = this.sup3
      ? combinaisonListes([false, true], this.nbQuestions)
      : combinaisonListes([false], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = numAlpha(0)
      let bonneReponse
      let questionNumerique = ''
      let variable1 = ''
      let variable2 = ''
      let reponseNumerique = [0]
      const choixDiviseurOuMultiple = typesDeVocabulaire[i]
      switch (listeTypeDeProblemes[i]) {
        case 1: {
          texteCorr += NiLUnNiLautre[i]
            ? "Rien n'indique que les rangées doivent être totalement remplies.<br> Donc, il peut y avoir des places vides et deux rangées peuvent avoir un nombre différent de spectateurs.<br>"
            : "Les rangées doivent être totalement remplies par l'ensemble des spectateurs, il n'y a pas de places vides.<br>"
          texteCorr += 'De ce fait, '
          if (NiLUnNiLautre[i]) {
            texteCorr +=
              texteEnCouleurEtGras(
                "ni le nombre de sièges, ni le nombre de spectateurs n'est un diviseur ou un multiple de l'autre",
              ) + '.<br><br>'
          }
          variable1 = 'le nombre de sièges dans une rangée'
          variable2 = 'le nombre de spectateurs'
          if (typesDeResultats[i] === 'Multiple') {
            const nbSieges = randint(7, 11)
            const jaugeMin =
              randint(5, 10) * nbSieges +
              randint(1, nbSieges - 1) * choice([1, -1])
            const jaugeMax = jaugeMin + nbSieges * randint(3, 6)

            texte = `Une salle de spectacle propose uniquement des rangées de $${nbSieges}$ sièges.<br>Pour un spectacle bien particulier, `
            texte += NiLUnNiLautre[i]
              ? ''
              : `toutes les rangées doivent être totalement remplies et `
            texte += `entre $${jaugeMin}$ et $${jaugeMax}$ personnes, seulement, peuvent être accueillies.<br>`
            texte +=
              'On veut connaître le nombre de personnes que la salle peut exactement accueillir pour ce spectacle.<br><br>'
            questionNumerique +=
              'Combien de spectateurs peuvent être accueillis dans cette salle ?'
            const multipleMin = Math.floor(jaugeMin / nbSieges) + 1

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre de spectateurs pouvant être accueillis est donc un nombre choisi entre $${miseEnEvidence(jaugeMin)}$ et $${miseEnEvidence(jaugeMax)}$.<br>`
              reponseNumerique = rangeMinMax(jaugeMin, jaugeMax)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un multiple de $${nbSieges}$, entre $${jaugeMin}$ et $${jaugeMax}$.<br>`

              reponseNumerique = rangeMinMax(
                multipleMin,
                Math.floor(jaugeMax / nbSieges),
              ).map((n) => n * nbSieges)

              const expressions = reponseNumerique.map(
                (val, i) =>
                  `$${nbSieges}\\times ${multipleMin + i} = ${miseEnEvidence(val)}$`,
              )
              let texteListe = ''
              if (expressions.length === 1) {
                texteListe = expressions[0]
              } else {
                texteListe = expressions.join('<br>')
              }
              texteCorr += `Les seuls multiples qui conviennent sont : <br>${texteListe}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              let texteListeMultiples = ''
              if (valeurs.length === 1) {
                texteListeMultiples = valeurs[0]
              } else {
                texteListeMultiples =
                  valeurs.slice(0, -1).join(', ') +
                  ' ou ' +
                  valeurs[valeurs.length - 1]
              }
              texteCorr += `Donc, le nombre de spectateurs accueillis dans cette salle peut être ${texteListeMultiples}.`
            }
          } else {
            let facteur1: number
            let facteur2: number
            let jauge: number
            let minFacteur: number
            let minSiege: number
            let maxSiege: number
            let listeD: number[]

            do {
              facteur1 = randint(5, 9)
              facteur2 = randint(5, 9, facteur1)
              jauge = facteur1 * facteur2

              minFacteur = Math.min(facteur1, facteur2)
              minSiege = minFacteur + randint(1, 3) * choice([1, -1])
              maxSiege = jauge - 16

              listeD = listeDesDiviseurs(jauge)

              reponseNumerique = listeD.filter(
                (n) => n > minSiege && n < maxSiege,
              )
            } while (reponseNumerique.length < 2)
            texte = `Une salle de spectacle doit accueillir exactement $${jauge}$ personnes.<br>
L’organisateur souhaite disposer les sièges en plusieurs rangées identiques, avec le même nombre de sièges par rangée.<br>
Pour ce spectacle, `
            texte += NiLUnNiLautre[i]
              ? ''
              : `les rangées doivent être totalement remplies et `
            texte += `l'organisateur veut qu’il y ait plus de $${minSiege}$ sièges par rangée et moins de $${maxSiege}$ sièges par rangée.<br>
`
            texte +=
              'On veut connaître le nombre de sièges par rangée pour ce spectacle.<br><br>'
            questionNumerique +=
              'Combien de sièges peut-il y avoir par rangée ?'

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre de sièges par rangée pour ce spectacle est donc un nombre choisi entre $${miseEnEvidence(minSiege)}$ et $${miseEnEvidence(maxSiege)}$.<br>`
              reponseNumerique = rangeMinMax(minSiege, maxSiege)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un diviseur de $${jauge}$, entre $${minSiege}$ et $${maxSiege}$.<br>`

              const expressions = reponseNumerique.map(
                (val) =>
                  `$${jauge}\\div ${miseEnEvidence(val)} = ${jauge / val}$`,
              )
              let texteListe = ''
              if (expressions.length === 1) {
                texteListe = expressions[0]
              } else {
                texteListe = expressions.join('<br>')
              }
              texteCorr += `Les seuls diviseurs de $${jauge}$ qui conviennent sont ceux qui divisent $${jauge}$ dans la liste suivante :<br> ${texteListe}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              let texteListeMultiples = ''
              if (valeurs.length === 1) {
                texteListeMultiples = valeurs[0]
              } else {
                texteListeMultiples =
                  valeurs.slice(0, -1).join(', ') +
                  ' ou ' +
                  valeurs[valeurs.length - 1]
              }
              texteCorr += `Donc, le nombre de sièges par rangée dans cette salle peut être ${texteListeMultiples}.`
            }
          }
          texte +=
            numAlpha(0) + 'Parmi ces propositions, laquelle est correcte ?'
          bonneReponse =
            choixDiviseurOuMultiple === 'Diviseur'
              ? 'variable1DiviseurDeVariable2'
              : 'variable2MultipleDeVariable1'

          break
        }

        case 2: {
          texteCorr += NiLUnNiLautre[i]
            ? "Rien n'indique que tous les bonbons doivent être utilisés, ni que les sachets doivent être identiques.<br> Donc, il peut rester des bonbons et deux sachets peuvent contenir un nombre différent de bonbons.<br>"
            : 'Tous les bonbons doivent être répartis dans des sachets identiques, sans en laisser aucun de côté.<br>'
          texteCorr += 'De ce fait, '
          if (NiLUnNiLautre[i]) {
            texteCorr +=
              texteEnCouleurEtGras(
                "ni le nombre de bonbons par sachet, ni le nombre total de bonbons n'est un diviseur ou un multiple de l'autre",
              ) + '.<br><br>'
          }
          variable1 = 'le nombre de bonbons par sachet'
          variable2 = 'le nombre total de bonbons'

          if (typesDeResultats[i] === 'Multiple') {
            // nb de bonbons par sachet fixé → trouver le total (multiple)
            const nbParSachet = randint(4, 9)
            const totalMin =
              randint(4, 8) * nbParSachet +
              randint(1, nbParSachet - 1) * choice([1, -1])
            const totalMax = totalMin + nbParSachet * randint(3, 6)

            texte = `Un confiseur prépare des sachets `
            texte += NiLUnNiLautre[i]
              ? `pouvant contenir $${nbParSachet}$ bonbons.<br>Pour une fête, `
              : `contenant chacun exactement $${nbParSachet}$ bonbons.<br>Pour une fête, `
            texte += `le nombre total de bonbons distribués doit être compris entre $${totalMin}$ et $${totalMax}$.<br>`
            texte +=
              'On veut connaître le nombre total de bonbons distribués lors de cette fête.<br><br>'
            questionNumerique =
              'Combien de bonbons peuvent être distribués en tout ?'

            const multipleMin = Math.floor(totalMin / nbParSachet) + 1

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre total de bonbons distribués est donc un nombre choisi entre $${miseEnEvidence(totalMin)}$ et $${miseEnEvidence(totalMax)}$.<br>`
              reponseNumerique = rangeMinMax(totalMin, totalMax)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un multiple de $${nbParSachet}$, entre $${totalMin}$ et $${totalMax}$.<br>`

              reponseNumerique = rangeMinMax(
                multipleMin,
                Math.floor(totalMax / nbParSachet),
              ).map((n) => n * nbParSachet)

              const expressions = reponseNumerique.map(
                (val, idx) =>
                  `$${nbParSachet}\\times ${multipleMin + idx} = ${miseEnEvidence(val)}$`,
              )
              texteCorr += `Les seuls multiples qui conviennent sont : <br>${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre total de bonbons distribués peut être ${texteListeValeurs}.`
            }
          } else {
            // total de bonbons fixé → trouver le nb par sachet (diviseur)
            let facteur1: number
            let facteur2: number
            let totalBonbons: number
            let minParSachet: number
            let maxParSachet: number
            let listeD: number[]

            do {
              facteur1 = randint(5, 9)
              facteur2 = randint(5, 9, facteur1)
              totalBonbons = facteur1 * facteur2

              const minFacteur = Math.min(facteur1, facteur2)
              minParSachet = minFacteur + randint(1, 3) * choice([1, -1])
              maxParSachet = totalBonbons - 16

              listeD = listeDesDiviseurs(totalBonbons)
              reponseNumerique = listeD.filter(
                (n) => n > minParSachet && n < maxParSachet,
              )
            } while (reponseNumerique.length < 2)

            texte = `Pour une kermesse, un animateur dispose exactement de $${totalBonbons}$ bonbons à distribuer.<br>`
            texte += NiLUnNiLautre[i]
              ? `Il souhaite les répartir dans des sachets.<br>Pour ce faire, `
              : `Il souhaite tous les répartir en sachets identiques contenant tous le même nombre de bonbons.<br>Pour ce faire, `
            texte += `il veut mettre plus de $${minParSachet}$ bonbons par sachet et moins de $${maxParSachet}$ bonbons par sachet.<br>`
            texte +=
              'On veut connaître le nombre de bonbons par sachet pour cette kermesse.<br><br>'
            questionNumerique =
              'Combien de bonbons peut-il y avoir dans chaque sachet ?'

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre de bonbons par sachet est donc un nombre choisi entre $${miseEnEvidence(minParSachet)}$ et $${miseEnEvidence(maxParSachet)}$.<br>`
              reponseNumerique = rangeMinMax(minParSachet, maxParSachet)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un diviseur de $${totalBonbons}$, entre $${minParSachet}$ et $${maxParSachet}$.<br>`

              const expressions = reponseNumerique.map(
                (val) =>
                  `$${totalBonbons}\\div ${miseEnEvidence(val)} = ${totalBonbons / val}$`,
              )
              texteCorr += `Les seuls diviseurs de $${totalBonbons}$ qui conviennent sont ceux qui divisent $${totalBonbons}$ dans la liste suivante :<br> ${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre de bonbons par sachet peut être ${texteListeValeurs}.`
            }
          }

          texte +=
            numAlpha(0) + 'Parmi ces propositions, laquelle est correcte ?'
          bonneReponse =
            choixDiviseurOuMultiple === 'Diviseur'
              ? 'variable1DiviseurDeVariable2'
              : 'variable2MultipleDeVariable1'

          break
        }

        case 3: {
          texteCorr += NiLUnNiLautre[i]
            ? "Rien n'indique que tous les arbres doivent être plantés, ni que les rangées doivent être identiques.<br> Donc, il peut rester des arbres non plantés et deux rangées peuvent contenir un nombre différent d'arbres.<br>"
            : 'Tous les arbres doivent être répartis en rangées complètes et identiques, sans en laisser aucun de côté.<br>'
          texteCorr += 'De ce fait, '
          if (NiLUnNiLautre[i]) {
            texteCorr +=
              texteEnCouleurEtGras(
                "ni le nombre d'arbres par rangée, ni le nombre total d'arbres n'est un diviseur ou un multiple de l'autre",
              ) + '.<br><br>'
          }
          variable1 = "le nombre d'arbres par rangée"
          variable2 = "le nombre total d'arbres"

          if (typesDeResultats[i] === 'Multiple') {
            // nb d'arbres par rangée fixé → trouver le total (multiple)
            const nbParRangee = randint(5, 10)
            const totalMin =
              randint(4, 8) * nbParRangee +
              randint(1, nbParRangee - 1) * choice([1, -1])
            const totalMax = totalMin + nbParRangee * randint(3, 6)

            texte = `Un pépiniériste plante des arbres `
            texte += NiLUnNiLautre[i]
              ? `en rangées pouvant accueillir $${nbParRangee}$ arbres.<br>Pour un verger, `
              : `en rangées de $${nbParRangee}$ arbres chacune.<br>Pour un verger, `
            texte += `le nombre total d'arbres plantés doit être compris entre $${totalMin}$ et $${totalMax}$.<br>`
            texte +=
              "On veut connaître le nombre total d'arbres plantés dans ce verger.<br><br>"
            questionNumerique =
              "Combien d'arbres peuvent être plantés en tout ?"

            const multipleMin = Math.floor(totalMin / nbParRangee) + 1

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre total d'arbres est donc un nombre choisi entre $${miseEnEvidence(totalMin)}$ et $${miseEnEvidence(totalMax)}$.<br>`
              reponseNumerique = rangeMinMax(totalMin, totalMax)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un multiple de $${nbParRangee}$, entre $${totalMin}$ et $${totalMax}$.<br>`

              reponseNumerique = rangeMinMax(
                multipleMin,
                Math.floor(totalMax / nbParRangee),
              ).map((n) => n * nbParRangee)

              const expressions = reponseNumerique.map(
                (val, idx) =>
                  `$${nbParRangee}\\times ${multipleMin + idx} = ${miseEnEvidence(val)}$`,
              )
              texteCorr += `Les seuls multiples qui conviennent sont : <br>${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre total d'arbres plantés dans ce verger peut être ${texteListeValeurs}.`
            }
          } else {
            // total d'arbres fixé → trouver le nb par rangée (diviseur)
            let facteur1: number
            let facteur2: number
            let totalArbres: number
            let minParRangee: number
            let maxParRangee: number
            let listeD: number[]

            do {
              facteur1 = randint(5, 9)
              facteur2 = randint(5, 9, facteur1)
              totalArbres = facteur1 * facteur2

              const minFacteur = Math.min(facteur1, facteur2)
              minParRangee = minFacteur + randint(1, 3) * choice([1, -1])
              maxParRangee = totalArbres - 16

              listeD = listeDesDiviseurs(totalArbres)
              reponseNumerique = listeD.filter(
                (n) => n > minParRangee && n < maxParRangee,
              )
            } while (reponseNumerique.length < 2)

            texte = `Un jardinier dispose exactement de $${totalArbres}$ arbres à planter dans un verger.<br>`
            texte += NiLUnNiLautre[i]
              ? `Il souhaite les disposer en rangées.<br>Pour ce faire, `
              : `Il souhaite les répartir en rangées complètes contenant toutes le même nombre d'arbres.<br>Pour ce faire, `
            texte += `il veut mettre plus de $${minParRangee}$ arbres par rangée et moins de $${maxParRangee}$ arbres par rangée.<br>`
            texte +=
              "On veut connaître le nombre d'arbres par rangée pour ce verger.<br><br>"
            questionNumerique = "Combien d'arbres peut-il y avoir par rangée ?"

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre d'arbres par rangée est donc un nombre choisi entre $${miseEnEvidence(minParRangee)}$ et $${miseEnEvidence(maxParRangee)}$.<br>`
              reponseNumerique = rangeMinMax(minParRangee, maxParRangee)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un diviseur de $${totalArbres}$, entre $${minParRangee}$ et $${maxParRangee}$.<br>`

              const expressions = reponseNumerique.map(
                (val) =>
                  `$${totalArbres}\\div ${miseEnEvidence(val)} = ${totalArbres / val}$`,
              )
              texteCorr += `Les seuls diviseurs de $${totalArbres}$ qui conviennent sont ceux qui divisent $${totalArbres}$ dans la liste suivante :<br> ${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre d'arbres par rangée dans ce verger peut être ${texteListeValeurs}.`
            }
          }

          texte +=
            numAlpha(0) + 'Parmi ces propositions, laquelle est correcte ?'
          bonneReponse =
            choixDiviseurOuMultiple === 'Diviseur'
              ? 'variable1DiviseurDeVariable2'
              : 'variable2MultipleDeVariable1'

          break
        }

        case 4: {
          texteCorr += NiLUnNiLautre[i]
            ? "Rien n'indique que tous les chocolats doivent être conditionnés, ni que les boîtes doivent être identiques.<br> Donc, il peut rester des chocolats et deux boîtes peuvent contenir un nombre différent de chocolats.<br>"
            : 'Tous les chocolats doivent être répartis dans des boîtes identiques, sans en laisser aucun de côté.<br>'
          texteCorr += 'De ce fait, '
          if (NiLUnNiLautre[i]) {
            texteCorr +=
              texteEnCouleurEtGras(
                "ni le nombre de chocolats par boîte, ni le nombre total de chocolats n'est un diviseur ou un multiple de l'autre",
              ) + '.<br><br>'
          }
          variable1 = 'le nombre de chocolats par boîte'
          variable2 = 'le nombre total de chocolats'

          if (typesDeResultats[i] === 'Multiple') {
            // nb de chocolats par boîte fixé → trouver le total (multiple)
            const nbParBoite = randint(4, 9)
            const totalMin =
              randint(4, 8) * nbParBoite +
              randint(1, nbParBoite - 1) * choice([1, -1])
            const totalMax = totalMin + nbParBoite * randint(3, 6)

            texte = `Une chocolaterie conditionne ses chocolats dans des boîtes `
            texte += NiLUnNiLautre[i]
              ? `pouvant contenir jusqu'à $${nbParBoite}$ chocolats.<br>Pour les fêtes de fin d'année, `
              : `contenant chacune exactement $${nbParBoite}$ chocolats.<br>Pour les fêtes de fin d'année, `
            texte += `le nombre total de chocolats à préparer doit être compris entre $${totalMin}$ et $${totalMax}$.<br>`
            texte +=
              'On veut connaître le nombre total de chocolats préparés.<br><br>'
            questionNumerique =
              'Combien de chocolats peuvent être préparés en tout ?'

            const multipleMin = Math.floor(totalMin / nbParBoite) + 1

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre total de chocolats est donc un nombre choisi entre $${miseEnEvidence(totalMin)}$ et $${miseEnEvidence(totalMax)}$.<br>`
              reponseNumerique = rangeMinMax(totalMin, totalMax)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un multiple de $${nbParBoite}$, entre $${totalMin}$ et $${totalMax}$.<br>`

              reponseNumerique = rangeMinMax(
                multipleMin,
                Math.floor(totalMax / nbParBoite),
              ).map((n) => n * nbParBoite)

              const expressions = reponseNumerique.map(
                (val, idx) =>
                  `$${nbParBoite}\\times ${multipleMin + idx} = ${miseEnEvidence(val)}$`,
              )
              texteCorr += `Les seuls multiples qui conviennent sont : <br>${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre total de chocolats préparés peut être ${texteListeValeurs}.`
            }
          } else {
            // total de chocolats fixé → trouver le nb par boîte (diviseur)
            let facteur1: number
            let facteur2: number
            let totalChocolats: number
            let minParBoite: number
            let maxParBoite: number
            let listeD: number[]

            do {
              facteur1 = randint(5, 9)
              facteur2 = randint(5, 9, facteur1)
              totalChocolats = facteur1 * facteur2

              const minFacteur = Math.min(facteur1, facteur2)
              minParBoite = minFacteur + randint(1, 3) * choice([1, -1])
              maxParBoite = totalChocolats - 16

              listeD = listeDesDiviseurs(totalChocolats)
              reponseNumerique = listeD.filter(
                (n) => n > minParBoite && n < maxParBoite,
              )
            } while (reponseNumerique.length < 2)

            texte = `Un artisan chocolatier doit conditionner exactement $${totalChocolats}$ chocolats.<br>`
            texte += NiLUnNiLautre[i]
              ? `Il souhaite les répartir dans des boîtes.<br>Pour ce faire, `
              : `Il souhaite les répartir dans des boîtes identiques contenant toutes le même nombre de chocolats, sans en laisser aucun de côté.<br>Pour ce faire, `
            texte += `il veut mettre plus de $${minParBoite}$ chocolats par boîte et moins de $${maxParBoite}$ chocolats par boîte.<br>`
            texte +=
              'On veut connaître le nombre de chocolats par boîte.<br><br>'
            questionNumerique =
              'Combien de chocolats peut-il y avoir dans chaque boîte ?'

            if (NiLUnNiLautre[i]) {
              texteCorr +=
                numAlpha(1) +
                `Le nombre de chocolats par boîte est donc un nombre choisi entre $${miseEnEvidence(minParBoite)}$ et $${miseEnEvidence(maxParBoite)}$.<br>`
              reponseNumerique = rangeMinMax(minParBoite, maxParBoite)
            } else {
              texteCorr +=
                choixDiviseurOuMultiple === 'Diviseur'
                  ? `${variable2} est un multiple ${contracterDe(variable1)} et ` +
                    texteEnCouleurEtGras(
                      `${variable1} est un diviseur ${contracterDe(variable2)}.`,
                    )
                  : texteEnCouleurEtGras(
                      `${variable2} est un multiple ${contracterDe(variable1)}`,
                    ) +
                    ` et ${variable1} est un diviseur ${contracterDe(variable2)}.`
              texteCorr += '<br><br>'
              texteCorr +=
                numAlpha(1) +
                ` Il faut donc trouver un diviseur de $${totalChocolats}$, entre $${minParBoite}$ et $${maxParBoite}$.<br>`

              const expressions = reponseNumerique.map(
                (val) =>
                  `$${totalChocolats}\\div ${miseEnEvidence(val)} = ${totalChocolats / val}$`,
              )
              texteCorr += `Les seuls diviseurs de $${totalChocolats}$ qui conviennent sont ceux qui divisent $${totalChocolats}$ dans la liste suivante :<br> ${expressions.join('<br>')}<br>`

              const valeurs = reponseNumerique.map(
                (v) => `$${miseEnEvidence(v)}$`,
              )
              const texteListeValeurs =
                valeurs.length === 1
                  ? valeurs[0]
                  : valeurs.slice(0, -1).join(', ') +
                    ' ou ' +
                    valeurs[valeurs.length - 1]
              texteCorr += `Donc, le nombre de chocolats par boîte peut être ${texteListeValeurs}.`
            }
          }

          texte +=
            numAlpha(0) + 'Parmi ces propositions, laquelle est correcte ?'
          bonneReponse =
            choixDiviseurOuMultiple === 'Diviseur'
              ? 'variable1DiviseurDeVariable2'
              : 'variable2MultipleDeVariable1'

          break
        }
      }

      this.autoCorrection[2 * i] = {}
      this.autoCorrection[2 * i].options = {
        ordered: true,
        radio: true,
        vertical: true,
      }
      if (choixDiviseurOuMultiple === 'Diviseur')
        this.autoCorrection[2 * i].propositions = [
          {
            texte: `${majusculeInitiale(variable1)} est un diviseur ${contracterDe(variable2)}.`,
            statut: bonneReponse === 'variable1DiviseurDeVariable2',
          },
          {
            texte: `${majusculeInitiale(variable2)} est un diviseur ${contracterDe(variable1)}.`,
            statut: bonneReponse === 'variable2DiviseurDeVariable1',
          },
          {
            // texte: `${majusculeInitiale(variable1)} n'est pas un diviseur ${contracterDe(variable2)} et ${majusculeInitiale(variable2)} n'est pas un diviseur ${contracterDe(variable1)}.`,
            texte: `Pas de lien avec des diviseurs dans ce problème ; aucune des propositions précédentes n'est correcte.`,
            statut: bonneReponse === 'NiLUnNiLautre[i]',
          },
        ]
      else
        this.autoCorrection[2 * i].propositions = [
          {
            texte: `${majusculeInitiale(variable1)} est un multiple ${contracterDe(variable2)}.`,
            statut: bonneReponse === 'variable1MultipleDeVariable2',
          },
          {
            texte: `${majusculeInitiale(variable2)} est un multiple ${contracterDe(variable1)}.`,
            statut: bonneReponse === 'variable2MultipleDeVariable1',
          },
          {
            // texte: `${majusculeInitiale(variable1)} n'est pas un multiple ${contracterDe(variable2)} et ${majusculeInitiale(variable2)} n'est pas un multiple ${contracterDe(variable1)}.`,
            texte: `Pas de lien avec des multiples dans ce problème ; aucune des propositions précédentes n'est correcte.`,
            statut: bonneReponse === 'NiLUnNiLautre[i]',
          },
        ]
      const props = propositionsQcm(this, 2 * i)
      texte += props.texte

      texte +=
        numAlpha(1) +
        questionNumerique +
        " Si plusieurs réponses sont possibles, n'en indiquer qu'une seule."
      texte += ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        KeyboardType.clavierNumbers,
      )
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: reponseNumerique,
          options: { nombreDecimalSeulement: true },
        },
      })
      if (!this.interactif) texte += ' Justifier la réponse.'
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
