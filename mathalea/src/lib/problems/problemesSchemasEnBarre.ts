import { randint } from '../../modules/outils'
import type {
  NbRectangles,
  SchemaEnBarreAttendu,
  SchemaEnBarreType,
} from '../customElements/SchemaEnBarreElement'
import { choice, shuffle } from '../outils/arrayOutils'
import { miseEnEvidence } from '../outils/embellissements'
import { deDevant, queDevant } from '../outils/outilString'
import { prenoms } from '../outils/Personne'
import { texNombre } from '../outils/texNombre'

/**
 * Banque de problèmes à modéliser par un schéma en barre (exercice `6N4A-5`).
 *
 * Chaque problème porte, en plus de son énoncé :
 * - le schéma attendu : le type, les textes à retrouver (grandeur, quantité et
 *   unité, la valeur cherchée étant notée `?`) et, pour un schéma
 *   multiplicatif dont le nombre de parts est connu, le nombre de rectangles ;
 * - les calculs de la correction, écrits avec ou sans unités ;
 * - la phrase de conclusion, dont la valeur est demandée à l'élève.
 *
 * @author Rémi Angot
 */

export type Terme = { valeur: number; unite?: string }
export type Calcul = {
  termes: Terme[]
  operateur: '+' | '-' | '\\times' | '\\div'
  resultat: Terme
  /** Texte qui précède le calcul, sur la même ligne (« On retire … du total, il reste »). */
  avant?: string
  /** Phrase qui suit le calcul, à la ligne (« Une boîte coûte 12 €. »). */
  phrase?: string
}
export type Conclusion = {
  avant: string
  reponse: number
  unite: string
  apres: string
  /**
   * Seconde réponse à trouver, qui prolonge la phrase (« et Léa a … billes. ») ;
   * `apres` est alors ignoré. Les deux champs valent un seul point.
   */
  suite?: Conclusion
}
export type ProblemeSchemaEnBarre = {
  enonce: string
  /** Identifie le type de problème et la valeur cherchée. */
  explication: string
  attendu: SchemaEnBarreAttendu
  calculs: Calcul[]
  conclusion: Conclusion
}

/** Un rectangle par part de 2 à 5, des pointillés au-delà (ou si le nombre de parts n'est pas dessinable). */
export function nbRectanglesPour(nbParts: number): NbRectangles {
  return Number.isInteger(nbParts) && nbParts >= 2 && nbParts <= 5
    ? (nbParts as NbRectangles)
    : 'plus'
}

function texTerme({ valeur, unite }: Terme, avecUnites: boolean): string {
  const nombre = texNombre(valeur, 2)
  return unite != null && unite !== '' && avecUnites
    ? `${nombre}\\text{ ${unite}}`
    : nombre
}

/**
 * Le calcul en LaTeX : `12\text{ tulipes}-6\text{ tulipes}=6\text{ tulipes}`
 * avec les unités, `12-6=6` sans. Le résultat est mis en évidence quand
 * `final` est vrai.
 */
export function texCalcul(
  calcul: Calcul,
  avecUnites: boolean,
  final: boolean,
): string {
  const membre = calcul.termes
    .map((terme) => texTerme(terme, avecUnites))
    .join(calcul.operateur)
  const resultat = texTerme(calcul.resultat, avecUnites)
  return `$${membre}=${final ? miseEnEvidence(resultat) : resultat}$`
}

/** La ligne de correction d'un calcul : texte d'introduction, calcul, puis phrase à la ligne. */
export function texLigneCalcul(
  calcul: Calcul,
  avecUnites: boolean,
  final: boolean,
): string {
  return `${calcul.avant == null ? '' : `${calcul.avant} `}${texCalcul(calcul, avecUnites, final)}${calcul.phrase == null ? '' : `<br>${calcul.phrase}`}`
}

/** La phrase de conclusion avec la ou les réponses mises en évidence. */
export function texConclusion({
  avant,
  reponse,
  unite,
  apres,
  suite,
}: Conclusion): string {
  const debut = `${avant} $${miseEnEvidence(texNombre(reponse, 2))}$ ${unite}`
  if (suite != null) return `${debut} ${texConclusion(suite)}`
  return `${debut}${apres === '' ? '.' : ` ${apres}`}`
}

function deuxPersonnes() {
  const [premier, second] = shuffle(prenoms).slice(0, 2)
  return { premier, second }
}

/** Pronoms de deux personnes : « elles » seulement si les deux sont féminines. */
function pronomsDuo(premier: { pronom: string }, second: { pronom: string }) {
  const feminin = premier.pronom === 'elle' && second.pronom === 'elle'
  return { ils: feminin ? 'elles' : 'ils', eux: feminin ? 'elles' : 'eux' }
}

const nb = (valeur: number) => `$${texNombre(valeur, 0)}$`

/* ------------------------------ Additif de parties-tout ------------------------------ */

function lectureTout(): ProblemeSchemaEnBarre {
  const { prenom, pronom } = choice(prenoms)
  const a = randint(12, 45)
  const b = randint(12, 45, a)
  return {
    enonce: `${prenom} a lu ${nb(a)} pages le matin et ${nb(b)} pages l'après-midi.<br>Combien de pages a-t-${pronom} lues en tout ?`,
    explication:
      "C'est un problème additif de parties-tout : on connaît les deux parties et on cherche le tout.",
    attendu: {
      type: 'additif-parties-tout',
      textes: {
        partieA: `Matin\n${a} pages`,
        partieB: `Après-midi\n${b} pages`,
        tout: '? pages',
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a, unite: 'pages' },
          { valeur: b, unite: 'pages' },
        ],
        operateur: '+',
        resultat: { valeur: a + b, unite: 'pages' },
      },
    ],
    conclusion: {
      avant: `${prenom} a lu`,
      reponse: a + b,
      unite: 'pages',
      apres: 'en tout.',
    },
  }
}

function carTout(): ProblemeSchemaEnBarre {
  const a = randint(18, 40)
  const b = randint(3, 9)
  return {
    enonce: `Dans un car, il y a ${nb(a)} enfants et ${nb(b)} adultes.<br>Combien y a-t-il de personnes dans ce car ?`,
    explication:
      "C'est un problème additif de parties-tout : on connaît les deux parties et on cherche le tout.",
    attendu: {
      type: 'additif-parties-tout',
      textes: {
        partieA: `${a} enfants`,
        partieB: `${b} adultes`,
        tout: '? personnes',
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a, unite: 'enfants' },
          { valeur: b, unite: 'adultes' },
        ],
        operateur: '+',
        resultat: { valeur: a + b, unite: 'personnes' },
      },
    ],
    conclusion: {
      avant: 'Il y a',
      reponse: a + b,
      unite: 'personnes',
      apres: 'dans ce car.',
    },
  }
}

function billesPartie(): ProblemeSchemaEnBarre {
  const { prenom, pronom } = choice(prenoms)
  const a = randint(8, 30)
  const b = randint(8, 30)
  return {
    enonce: `${prenom} a ${nb(a + b)} billes : ${nb(a)} sont rouges et les autres sont bleues.<br>Combien a-t-${pronom} de billes bleues ?`,
    explication:
      "C'est un problème additif de parties-tout : on connaît le tout et une partie, on cherche l'autre partie.",
    attendu: {
      type: 'additif-parties-tout',
      textes: {
        partieA: `Rouges\n${a} billes`,
        partieB: 'Bleues\n? billes',
        tout: `${a + b} billes`,
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a + b, unite: 'billes' },
          { valeur: a, unite: 'billes' },
        ],
        operateur: '-',
        resultat: { valeur: b, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `${prenom} a`,
      reponse: b,
      unite: 'billes',
      apres: 'bleues.',
    },
  }
}

function bouquetPartie(): ProblemeSchemaEnBarre {
  const a = randint(5, 15)
  const b = randint(5, 15)
  return {
    enonce: `Un bouquet de ${nb(a + b)} fleurs contient ${nb(a)} roses et des tulipes.<br>Combien y a-t-il de tulipes dans ce bouquet ?`,
    explication:
      "C'est un problème additif de parties-tout : on connaît le tout et une partie, on cherche l'autre partie.",
    attendu: {
      type: 'additif-parties-tout',
      textes: {
        partieA: `Roses\n${a} fleurs`,
        partieB: 'Tulipes\n? fleurs',
        tout: `${a + b} fleurs`,
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a + b, unite: 'fleurs' },
          { valeur: a, unite: 'fleurs' },
        ],
        operateur: '-',
        resultat: { valeur: b, unite: 'fleurs' },
      },
    ],
    conclusion: {
      avant: 'Il y a',
      reponse: b,
      unite: 'tulipes',
      apres: 'dans ce bouquet.',
    },
  }
}

/* ------------------------------- Additif de comparaison ------------------------------ */

function cartesGrande(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const b = randint(15, 40)
  const d = randint(4, 12)
  return {
    enonce: `${premier.prenom} a ${nb(b)} cartes. ${second.prenom} en a ${nb(d)} de plus ${queDevant(premier.prenom)}.<br>Combien ${second.prenom} a-t-${second.pronom} de cartes ?`,
    explication:
      "C'est un problème additif de comparaison : on connaît la petite quantité et la différence, on cherche la grande quantité.",
    attendu: {
      type: 'additif-comparaison',
      textes: {
        partieA: `${second.prenom}\n? cartes`,
        partieB: `${premier.prenom}\n${b} cartes`,
        difference: `${d} cartes`,
      },
    },
    calculs: [
      {
        termes: [
          { valeur: b, unite: 'cartes' },
          { valeur: d, unite: 'cartes' },
        ],
        operateur: '+',
        resultat: { valeur: b + d, unite: 'cartes' },
      },
    ],
    conclusion: {
      avant: `${second.prenom} a`,
      reponse: b + d,
      unite: 'cartes',
      apres: '',
    },
  }
}

function billesPetite(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const a = randint(20, 50)
  const d = randint(4, 12)
  return {
    enonce: `${premier.prenom} a ${nb(a)} billes. ${second.prenom} en a ${nb(d)} de moins ${queDevant(premier.prenom)}.<br>Combien ${second.prenom} a-t-${second.pronom} de billes ?`,
    explication:
      "C'est un problème additif de comparaison : on connaît la grande quantité et la différence, on cherche la petite quantité.",
    attendu: {
      type: 'additif-comparaison',
      textes: {
        partieA: `${premier.prenom}\n${a} billes`,
        partieB: `${second.prenom}\n? billes`,
        difference: `${d} billes`,
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a, unite: 'billes' },
          { valeur: d, unite: 'billes' },
        ],
        operateur: '-',
        resultat: { valeur: a - d, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `${second.prenom} a`,
      reponse: a - d,
      unite: 'billes',
      apres: '',
    },
  }
}

function taillesDifference(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const b = randint(120, 150)
  const a = b + randint(5, 25)
  return {
    enonce: `${premier.prenom} mesure ${nb(a)} cm et ${second.prenom} mesure ${nb(b)} cm.<br>De combien de centimètres ${premier.prenom} dépasse-t-${premier.pronom} ${second.prenom} ?`,
    explication:
      "C'est un problème additif de comparaison : on connaît les deux quantités, on cherche leur différence.",
    attendu: {
      type: 'additif-comparaison',
      textes: {
        partieA: `${premier.prenom}\n${a} cm`,
        partieB: `${second.prenom}\n${b} cm`,
        difference: '? cm',
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a, unite: 'cm' },
          { valeur: b, unite: 'cm' },
        ],
        operateur: '-',
        resultat: { valeur: a - b, unite: 'cm' },
      },
    ],
    conclusion: {
      avant: `${premier.prenom} dépasse ${second.prenom} de`,
      reponse: a - b,
      unite: 'cm',
      apres: '',
    },
  }
}

/* ------------------------- Additif de comparaison avec total ------------------------- */

function timbresTout(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const { ils, eux } = pronomsDuo(premier, second)
  const a = randint(30, 60)
  const d = randint(5, 15)
  return {
    enonce: `${premier.prenom} a ${nb(a)} timbres. ${second.prenom} en a ${nb(d)} de moins ${queDevant(premier.prenom)}.<br>Combien de timbres ont-${ils} à ${eux} deux ?`,
    explication:
      "C'est un problème additif de comparaison avec total : on connaît la grande quantité et la différence, on cherche le tout.",
    attendu: {
      type: 'additif-comparaison-total',
      textes: {
        partieA: `${premier.prenom}\n${a} timbres`,
        partieB: `${second.prenom}\n? timbres`,
        difference: `${d} timbres`,
        tout: '? timbres',
      },
    },
    calculs: [
      {
        termes: [
          { valeur: a, unite: 'timbres' },
          { valeur: d, unite: 'timbres' },
        ],
        operateur: '-',
        resultat: { valeur: a - d, unite: 'timbres' },
        phrase: `${second.prenom} a ${nb(a - d)} timbres.`,
      },
      {
        termes: [
          { valeur: a, unite: 'timbres' },
          { valeur: a - d, unite: 'timbres' },
        ],
        operateur: '+',
        resultat: { valeur: 2 * a - d, unite: 'timbres' },
      },
    ],
    conclusion: {
      avant: `À ${eux} deux, ${ils} ont`,
      reponse: 2 * a - d,
      unite: 'timbres',
      apres: '',
    },
  }
}

function billesReunies(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const { ils } = pronomsDuo(premier, second)
  const petite = randint(30, 80)
  const d = choice([5, 10, 15, 20, 25])
  const tout = 2 * petite + d
  return {
    enonce: `${premier.prenom} a ${nb(d)} billes de plus ${queDevant(second.prenom)}. En réunissant leurs billes, ${ils} en ont ${nb(tout)}.<br>Combien de billes possède chaque enfant ?`,
    explication:
      "C'est un problème additif de comparaison avec total : on connaît le tout et la différence, on cherche les deux quantités.",
    attendu: {
      type: 'additif-comparaison-total',
      textes: {
        partieA: `${premier.prenom}\n? billes`,
        partieB: `${second.prenom}\n? billes`,
        difference: `${d} billes`,
        tout: `${tout} billes`,
      },
    },
    calculs: [
      {
        avant: `On retire les ${nb(d)} billes de plus ${deDevant(premier.prenom)} du total, il reste`,
        termes: [
          { valeur: tout, unite: 'billes' },
          { valeur: d, unite: 'billes' },
        ],
        operateur: '-',
        resultat: { valeur: 2 * petite, unite: 'billes' },
      },
      {
        avant: `Ces ${nb(2 * petite)} billes sont réparties équitablement entre les deux parts égales :`,
        termes: [{ valeur: 2 * petite, unite: 'billes' }, { valeur: 2 }],
        operateur: '\\div',
        resultat: { valeur: petite, unite: 'billes' },
        phrase: `${second.prenom} a ${nb(petite)} billes.`,
      },
      {
        avant: `Billes ${deDevant(premier.prenom)} :`,
        termes: [
          { valeur: petite, unite: 'billes' },
          { valeur: d, unite: 'billes' },
        ],
        operateur: '+',
        resultat: { valeur: petite + d, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `${premier.prenom} a`,
      reponse: petite + d,
      unite: 'billes',
      apres: '',
      suite: {
        avant: `et ${second.prenom} a`,
        reponse: petite,
        unite: 'billes',
        apres: '',
      },
    },
  }
}

function bouchonBouteille(): ProblemeSchemaEnBarre {
  const bouchon = randint(3, 9)
  const d = choice([80, 90, 100, 120, 150])
  const tout = 2 * bouchon + d
  return {
    enonce: `Un bouchon et une bouteille pèsent à eux deux ${nb(tout)} g. Sachant que la bouteille pèse ${nb(d)} g de plus que le bouchon, quelle est la masse du bouchon ?`,
    explication:
      "C'est un problème additif de comparaison avec total : on connaît le tout et la différence, on cherche la petite quantité.",
    attendu: {
      type: 'additif-comparaison-total',
      textes: {
        partieA: 'Bouteille\n? g',
        partieB: 'Bouchon\n? g',
        difference: `${d} g`,
        tout: `${tout} g`,
      },
    },
    calculs: [
      {
        avant: `On enlève ${nb(d)} g au total pour trouver la masse de deux bouchons :`,
        termes: [
          { valeur: tout, unite: 'g' },
          { valeur: d, unite: 'g' },
        ],
        operateur: '-',
        resultat: { valeur: 2 * bouchon, unite: 'g' },
      },
      {
        avant: "La masse d'un bouchon est donc :",
        termes: [{ valeur: 2 * bouchon, unite: 'g' }, { valeur: 2 }],
        operateur: '\\div',
        resultat: { valeur: bouchon, unite: 'g' },
      },
    ],
    conclusion: {
      avant: 'Un bouchon pèse',
      reponse: bouchon,
      unite: 'grammes',
      apres: '',
    },
  }
}

/* --------------------------- Multiplicatif de parties-tout --------------------------- */

function oeufsTout(): ProblemeSchemaEnBarre {
  const n = choice([3, 4, 5, 6, 8, 12])
  const p = choice([6, 10, 12])
  return {
    enonce: `Un restaurant reçoit ${nb(n)} boîtes de ${nb(p)} œufs.<br>Combien d'œufs reçoit-il en tout ?`,
    explication:
      "C'est un problème multiplicatif de parties-tout : on connaît le nombre de parts et la valeur d'une part, on cherche le tout.",
    attendu: {
      type: 'multiplicatif-parties-tout',
      textes: {
        part: `${p} œufs`,
        nombreDeParts: `${n} boîtes`,
        tout: '? œufs',
      },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: p, unite: 'œufs' }],
        operateur: '\\times',
        resultat: { valeur: n * p, unite: 'œufs' },
      },
    ],
    conclusion: {
      avant: 'Le restaurant reçoit',
      reponse: n * p,
      unite: 'œufs',
      apres: 'en tout.',
    },
  }
}

function coureurTout(): ProblemeSchemaEnBarre {
  const { prenom, pronom } = choice(prenoms)
  const n = randint(3, 7)
  const p = randint(3, 9)
  return {
    enonce: `${prenom} court ${nb(p)} km chaque jour pendant ${nb(n)} jours.<br>Quelle distance parcourt-${pronom} en tout ?`,
    explication:
      "C'est un problème multiplicatif de parties-tout : on connaît le nombre de parts et la valeur d'une part, on cherche le tout.",
    attendu: {
      type: 'multiplicatif-parties-tout',
      textes: {
        part: `${p} km`,
        nombreDeParts: `${n} jours`,
        tout: '? km',
      },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: p, unite: 'km' }],
        operateur: '\\times',
        resultat: { valeur: n * p, unite: 'km' },
      },
    ],
    conclusion: {
      avant: `${prenom} parcourt`,
      reponse: n * p,
      unite: 'km',
      apres: 'en tout.',
    },
  }
}

function bonbonsPart(): ProblemeSchemaEnBarre {
  const { prenom } = choice(prenoms)
  const n = randint(3, 6)
  const p = randint(4, 12)
  return {
    enonce: `${prenom} partage équitablement ${nb(n * p)} bonbons entre ${nb(n)} enfants.<br>Combien de bonbons reçoit chaque enfant ?`,
    explication:
      "C'est un problème multiplicatif de parties-tout : on connaît le tout et le nombre de parts, on cherche la valeur d'une part.",
    attendu: {
      type: 'multiplicatif-parties-tout',
      textes: {
        part: '? bonbons',
        nombreDeParts: `${n} enfants`,
        tout: `${n * p} bonbons`,
      },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n * p, unite: 'bonbons' }, { valeur: n }],
        operateur: '\\div',
        resultat: { valeur: p, unite: 'bonbons' },
      },
    ],
    conclusion: {
      avant: 'Chaque enfant reçoit',
      reponse: p,
      unite: 'bonbons',
      apres: '',
    },
  }
}

function boitesNombreDeParts(): ProblemeSchemaEnBarre {
  const p = choice([4, 6, 8])
  const n = randint(5, 12)
  return {
    enonce: `Une fermière range ${nb(n * p)} œufs dans des boîtes de ${nb(p)} œufs.<br>Combien de boîtes remplit-elle ?`,
    explication:
      "C'est un problème multiplicatif de parties-tout : on connaît le tout et la valeur d'une part, on cherche le nombre de parts.",
    attendu: {
      type: 'multiplicatif-parties-tout',
      textes: {
        part: `${p} œufs`,
        nombreDeParts: '? boîtes',
        tout: `${n * p} œufs`,
      },
    },
    calculs: [
      {
        termes: [
          { valeur: n * p, unite: 'œufs' },
          { valeur: p, unite: 'œufs' },
        ],
        operateur: '\\div',
        resultat: { valeur: n },
      },
    ],
    conclusion: {
      avant: 'Elle remplit',
      reponse: n,
      unite: 'boîtes',
      apres: '',
    },
  }
}

/* --------------------------- Multiplicatif de comparaison ---------------------------- */

function billesGrande(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const a = randint(3, 9)
  const n = randint(3, 5)
  return {
    enonce: `${premier.prenom} a ${nb(a)} billes. ${second.prenom} en a ${nb(n)} fois plus ${queDevant(premier.prenom)}.<br>Combien ${second.prenom} a-t-${second.pronom} de billes ?`,
    explication:
      "C'est un problème multiplicatif de comparaison : on connaît la petite quantité et le nombre de fois, on cherche la grande quantité.",
    attendu: {
      type: 'multiplicatif-comparaison',
      textes: {
        part: `${a} billes`,
        nFois: `${n} fois`,
        etiquetteB: `${second.prenom}\n? billes`,
      },
      textesIndicatifs: { etiquetteA: premier.prenom },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: a, unite: 'billes' }],
        operateur: '\\times',
        resultat: { valeur: n * a, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `${second.prenom} a`,
      reponse: n * a,
      unite: 'billes',
      apres: '',
    },
  }
}

function cartesPetite(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const a = randint(4, 12)
  const n = randint(3, 5)
  return {
    enonce: `${premier.prenom} a ${nb(n * a)} cartes. C'est ${nb(n)} fois plus ${queDevant(second.prenom)}.<br>Combien ${second.prenom} a-t-${second.pronom} de cartes ?`,
    explication:
      "C'est un problème multiplicatif de comparaison : on connaît la grande quantité et le nombre de fois, on cherche la petite quantité.",
    attendu: {
      type: 'multiplicatif-comparaison',
      textes: {
        part: '? cartes',
        nFois: `${n} fois`,
        etiquetteB: `${premier.prenom}\n${n * a} cartes`,
      },
      textesIndicatifs: { etiquetteA: second.prenom },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n * a, unite: 'cartes' }, { valeur: n }],
        operateur: '\\div',
        resultat: { valeur: a, unite: 'cartes' },
      },
    ],
    conclusion: {
      avant: `${second.prenom} a`,
      reponse: a,
      unite: 'cartes',
      apres: '',
    },
  }
}

function chocolatsGrande(): ProblemeSchemaEnBarre {
  const a = randint(2, 6)
  const n = randint(3, 6)
  return {
    enonce: `Un sachet de chocolats coûte ${nb(a)} €. Une boîte coûte ${nb(n)} fois plus cher qu'un sachet.<br>Combien coûte une boîte ?`,
    explication:
      "C'est un problème multiplicatif de comparaison : on connaît la petite quantité et le nombre de fois, on cherche la grande quantité.",
    attendu: {
      type: 'multiplicatif-comparaison',
      textes: {
        part: `${a} €`,
        nFois: `${n} fois`,
        etiquetteB: 'Boîte\n? €',
      },
      textesIndicatifs: { etiquetteA: 'Sachet' },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: a, unite: '€' }],
        operateur: '\\times',
        resultat: { valeur: n * a, unite: '€' },
      },
    ],
    conclusion: {
      avant: 'Une boîte coûte',
      reponse: n * a,
      unite: '€',
      apres: '',
    },
  }
}

function timbresNombreDeFois(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const a = randint(3, 9)
  const n = randint(3, 6)
  return {
    enonce: `${premier.prenom} a ${nb(a)} timbres et ${second.prenom} en a ${nb(n * a)}.<br>Combien de fois plus de timbres ${second.prenom} a-t-${second.pronom} ${queDevant(premier.prenom)} ?`,
    explication:
      "C'est un problème multiplicatif de comparaison : on connaît les deux quantités, on cherche le nombre de fois.",
    attendu: {
      type: 'multiplicatif-comparaison',
      textes: {
        part: `${a} timbres`,
        nFois: '? fois',
        etiquetteB: `${second.prenom}\n${n * a} timbres`,
      },
      textesIndicatifs: { etiquetteA: premier.prenom },
    },
    calculs: [
      {
        termes: [
          { valeur: n * a, unite: 'timbres' },
          { valeur: a, unite: 'timbres' },
        ],
        operateur: '\\div',
        resultat: { valeur: n },
      },
    ],
    conclusion: {
      avant: `${second.prenom} a`,
      reponse: n,
      unite: 'fois',
      apres: `plus de timbres ${queDevant(premier.prenom)}.`,
    },
  }
}

/* ---------------------- Multiplicatif de comparaison avec total ---------------------- */

function chocolatsTout(): ProblemeSchemaEnBarre {
  const a = randint(2, 6)
  const n = randint(3, 6)
  return {
    enonce: `Un sachet de chocolats coûte ${nb(a)} €. Une boîte coûte ${nb(n)} fois plus cher qu'un sachet.<br>Combien coûtent un sachet et une boîte ensemble ?`,
    explication:
      "C'est un problème multiplicatif de comparaison avec total : on connaît la petite quantité et le nombre de fois, on cherche le tout.",
    attendu: {
      type: 'multiplicatif-comparaison-total',
      textes: { part: `${a} €`, nFois: `${n} fois`, tout: '? €' },
      textesIndicatifs: { etiquetteA: 'Sachet', etiquetteB: 'Boîte' },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: a, unite: '€' }],
        operateur: '\\times',
        resultat: { valeur: n * a, unite: '€' },
        phrase: `Une boîte coûte ${nb(n * a)} €.`,
      },
      {
        termes: [
          { valeur: a, unite: '€' },
          { valeur: n * a, unite: '€' },
        ],
        operateur: '+',
        resultat: { valeur: a + n * a, unite: '€' },
      },
    ],
    conclusion: {
      avant: 'Un sachet et une boîte coûtent',
      reponse: a + n * a,
      unite: '€',
      apres: 'ensemble.',
    },
  }
}

function billesTout(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const { ils, eux } = pronomsDuo(premier, second)
  const a = randint(3, 9)
  const n = randint(3, 5)
  return {
    enonce: `${premier.prenom} a ${nb(a)} billes. ${second.prenom} en a ${nb(n)} fois plus ${queDevant(premier.prenom)}.<br>Combien de billes ont-${ils} à ${eux} deux ?`,
    explication:
      "C'est un problème multiplicatif de comparaison avec total : on connaît la petite quantité et le nombre de fois, on cherche le tout.",
    attendu: {
      type: 'multiplicatif-comparaison-total',
      textes: { part: `${a} billes`, nFois: `${n} fois`, tout: '? billes' },
      textesIndicatifs: {
        etiquetteA: premier.prenom,
        etiquetteB: second.prenom,
      },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: n }, { valeur: a, unite: 'billes' }],
        operateur: '\\times',
        resultat: { valeur: n * a, unite: 'billes' },
        phrase: `${second.prenom} a ${nb(n * a)} billes.`,
      },
      {
        termes: [
          { valeur: a, unite: 'billes' },
          { valeur: n * a, unite: 'billes' },
        ],
        operateur: '+',
        resultat: { valeur: a + n * a, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `À ${eux} deux, ${ils} ont`,
      reponse: a + n * a,
      unite: 'billes',
      apres: '',
    },
  }
}

function chocolatsPart(): ProblemeSchemaEnBarre {
  const a = randint(2, 6)
  const n = randint(3, 5)
  return {
    enonce: `Un sachet et une boîte de chocolats coûtent ${nb(a + n * a)} € en tout. La boîte coûte ${nb(n)} fois plus cher que le sachet.<br>Quel est le prix d'un sachet ?`,
    explication:
      "C'est un problème multiplicatif de comparaison avec total : on connaît le tout et le nombre de fois, on cherche la petite quantité.",
    attendu: {
      type: 'multiplicatif-comparaison-total',
      textes: { part: '? €', nFois: `${n} fois`, tout: `${a + n * a} €` },
      textesIndicatifs: { etiquetteA: 'Sachet', etiquetteB: 'Boîte' },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: 1 }, { valeur: n }],
        operateur: '+',
        resultat: { valeur: n + 1 },
        phrase: `Le tout représente ${nb(n + 1)} parts égales.`,
      },
      {
        termes: [{ valeur: a + n * a, unite: '€' }, { valeur: n + 1 }],
        operateur: '\\div',
        resultat: { valeur: a, unite: '€' },
      },
    ],
    conclusion: {
      avant: 'Un sachet coûte',
      reponse: a,
      unite: '€',
      apres: '',
    },
  }
}

function billesPart(): ProblemeSchemaEnBarre {
  const { premier, second } = deuxPersonnes()
  const { eux } = pronomsDuo(premier, second)
  const a = randint(3, 9)
  const n = randint(3, 5)
  return {
    enonce: `${premier.prenom} et ${second.prenom} ont ${nb(a + n * a)} billes à ${eux} deux. ${second.prenom} en a ${nb(n)} fois plus ${queDevant(premier.prenom)}.<br>Combien ${premier.prenom} a-t-${premier.pronom} de billes ?`,
    explication:
      "C'est un problème multiplicatif de comparaison avec total : on connaît le tout et le nombre de fois, on cherche la petite quantité.",
    attendu: {
      type: 'multiplicatif-comparaison-total',
      textes: {
        part: '? billes',
        nFois: `${n} fois`,
        tout: `${a + n * a} billes`,
      },
      textesIndicatifs: {
        etiquetteA: premier.prenom,
        etiquetteB: second.prenom,
      },
      nbRectangles: nbRectanglesPour(n),
    },
    calculs: [
      {
        termes: [{ valeur: 1 }, { valeur: n }],
        operateur: '+',
        resultat: { valeur: n + 1 },
        phrase: `Le tout représente ${nb(n + 1)} parts égales.`,
      },
      {
        termes: [{ valeur: a + n * a, unite: 'billes' }, { valeur: n + 1 }],
        operateur: '\\div',
        resultat: { valeur: a, unite: 'billes' },
      },
    ],
    conclusion: {
      avant: `${premier.prenom} a`,
      reponse: a,
      unite: 'billes',
      apres: '',
    },
  }
}

export const problemesSchemasEnBarre: Record<
  SchemaEnBarreType,
  (() => ProblemeSchemaEnBarre)[]
> = {
  'additif-parties-tout': [lectureTout, billesPartie, carTout, bouquetPartie],
  'additif-comparaison': [cartesGrande, billesPetite, taillesDifference],
  'additif-comparaison-total': [timbresTout, billesReunies, bouchonBouteille],
  'multiplicatif-parties-tout': [
    oeufsTout,
    bonbonsPart,
    boitesNombreDeParts,
    coureurTout,
  ],
  'multiplicatif-comparaison': [
    billesGrande,
    cartesPetite,
    chocolatsGrande,
    timbresNombreDeFois,
  ],
  'multiplicatif-comparaison-total': [
    chocolatsTout,
    chocolatsPart,
    billesTout,
    billesPart,
  ],
}

/**
 * Les quatre familles de l'archive `6N4A-5-old`, dans leur ordre de tirage.
 * Figées : les modifier changerait les énoncés des liens déjà partagés.
 */
export const famillesArchive6N4A5 = [
  [lectureTout, billesPartie, carTout, bouquetPartie],
  [
    cartesGrande,
    billesPetite,
    taillesDifference,
    timbresTout,
    billesReunies,
    bouchonBouteille,
  ],
  [oeufsTout, bonbonsPart, boitesNombreDeParts, coureurTout],
  [chocolatsTout, chocolatsPart, billesTout, billesPart],
]
