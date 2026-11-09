<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { downloadFile } from '../../../lib/files'
  import { addSteps, missing } from '../../../lib/parcours/parcoursEditing'
  import {
    readParcoursFile,
    timestampedName,
  } from '../../../lib/parcours/parcoursFile'
  import {
    addClass,
    deleteParcours,
    duplicate,
    knownChapters,
    move,
    publish,
    removeClass,
    renameClass,
    restore,
    saveParcours,
    setClassParcours,
    toPublish,
    unpublishedCount,
    type TeacherLibrary,
  } from '../../../lib/parcours/parcoursLibrary'
  import {
    exerciseKey,
    mergeObjectives,
    taggedExercises,
  } from '../../../lib/parcours/parcoursObjectives'
  import {
    ALL_LEVELS,
    countryOf,
    exerciseIndex,
    levelsFor,
    type ReferentialExercise,
  } from '../../../lib/parcours/parcoursReferential'
  import {
    emptyParcours,
    levelName,
    parcoursId,
    levelGroups,
    type Lesson,
    type Objective,
    type Parcours,
    type Step,
  } from '../../../lib/parcours/parcoursTypes'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { mathaleaUpdateUrlFromExercicesParams } from '../../../lib/mathalea'
  import { isLanguage } from '../../../lib/types/languages'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import {
    loadParcoursSettings,
    PARCOURS_KEY,
    saveParcoursLibrary,
  } from '../../../lib/mesFeuilles/parcoursSettings'
  import NavBar from '../../shared/header/NavBar.svelte'
  import {
    createLessonFile,
    emptyLesson,
    lessonFileName,
    readLessonFile,
  } from '../../../lib/parcours/lessonFile'
  import LessonEditor from './LessonEditor.svelte'
  import ParcoursClasses from './ParcoursClasses.svelte'
  import ParcoursEditor from './ParcoursEditor.svelte'
  import ParcoursObjectives from './ParcoursObjectives.svelte'
  import ParcoursSchema from './ParcoursSchema.svelte'
  import ParcoursPlayer from './player/ParcoursPlayer.svelte'
  import SalonDrawer from './salon/SalonDrawer.svelte'
  import VersionsPanel from './salon/VersionsPanel.svelte'
  import DeletedParcours from './salon/DeletedParcours.svelte'
  import SalonPanel from './salon/SalonPanel.svelte'
  import SalonPointers from './salon/SalonPointers.svelte'
  import {
    me,
    salonMembers,
    storedToken,
    type Account,
  } from '../../../lib/parcours/salon/salonApi'
  import {
    DISCUSSION,
    markSeen,
    readSeen,
    unseenMentions,
  } from '../../../lib/parcours/salon/mentions'
  import {
    colorOf,
    elementName,
    initials,
    lessonDocId,
    lessonElementName,
    lockHolder,
    newKey,
    people,
    type EditorCollab,
    type Presence,
    type SalonSnapshot,
  } from '../../../lib/parcours/salon/salonPresence'
  import type { SalonConnection } from '../../../lib/parcours/salon/salonConnection'

  /**
   * Parcours de l'application MathALÉA, préparés sur le site : bibliothèque de
   * l'enseignant (enregistrée dans ce navigateur), classes, objectifs, et un
   * seul fichier à publier dans le dossier partagé des élèves. Le même fichier
   * se reprend ici ou dans l'application. Rien n'est envoyé à un serveur,
   * sauf les parcours des salons (édition à plusieurs, voir `salon/`).
   */

  // La bibliothèque est dans localStorage (voir `parcoursSettings.ts`) et fait
  // partie de « Mes sauvegardes » : fichier `.mathalea`, sauvegarde automatique
  let library: TeacherLibrary = $state(loadParcoursSettings().library)
  $effect(() => {
    // Sans modification, rien n'est réécrit : ni sauvegarde automatique ni rechargement des autres onglets
    saveParcoursLibrary($state.snapshot(library))
  })

  type View = 'parcours' | 'classes' | 'objectifs' | 'fiches'
  let view: View = $state('parcours')
  // Liste montrée dans l'onglet Objectifs : celle de ce navigateur ou d'un salon
  // (connecté : celle du salon d'abord, tant qu'on n'a pas choisi)
  let objectivesSalon: string | null = $state(null)
  let objectivesChosen = false
  // Lien d'invitation à un salon : le panneau du compte s'ouvre
  const invitation =
    new URLSearchParams(window.location.search).get('invitation') ?? ''
  let accountOpen = $state(invitation !== '')
  // À l'ouverture, la liste des parcours ; le parcours du lien venu de
  // « Mes sauvegardes » (paramètre `parcours`) s'ouvre directement
  let selectedId: string | null = $state(
    untrack(() => {
      const wanted = new URLSearchParams(window.location.search).get('parcours')
      return (
        library.entries.find((e) => e.parcours.id === wanted)?.parcours.id ??
        null
      )
    }),
  )
  // Parcours d'un salon : identifiant du salon (null : parcours de ce navigateur)
  let selectedSalon: string | null = $state(null)
  function select(id: string | null, salon: string | null = null) {
    selectedId = id
    selectedSalon = id ? salon : null
    confirmDelete = false
    drawerOpen = false
    scrollTo({ top: 0 })
  }

  // Édition seule, éditeur et aperçu élève côte à côte (par défaut), ou aperçu seul (retenu dans ce navigateur)
  type Display = 'edit' | 'split' | 'preview'
  const DISPLAY_KEY = 'mathalea-parcours-affichage'
  let display: Display = $state(
    untrack(() => {
      try {
        const d = localStorage.getItem(DISPLAY_KEY)
        if (d === 'edit' || d === 'split' || d === 'preview') return d
      } catch {
        // Stockage refusé : mode par défaut
      }
      // Par défaut, côte à côte (sur petit écran, l'éditeur seul)
      return window.innerWidth >= 1024 ? 'split' : 'edit'
    }),
  )
  function setDisplay(d: Display) {
    display = d
    try {
      localStorage.setItem(DISPLAY_KEY, d)
    } catch {
      // Stockage refusé : le mode vaut pour cette visite
    }
  }
  const selected = $derived(
    library.entries.find((e) => e.parcours.id === selectedId),
  )

  // ---------- Salons : connexion à chacun dès qu'on a un compte ----------
  let account = $state<Account | null>(null)
  // Instantanés tels quels (non profonds) : un parcours inchangé garde son
  // identité quand seule la présence bouge, l'éditeur n'est pas redessiné
  let snapshots: Record<string, SalonSnapshot> = $state.raw({})
  const connections = new Map<string, SalonConnection>()
  async function setAccount(a: Account | null) {
    account = a
    for (const [id, c] of connections)
      if (!a?.salons.some((s) => s.id === id)) {
        // Déconnexion : la copie de ce navigateur est effacée, sauf s'il reste
        // des modifications à envoyer (elles partiront à la prochaine connexion)
        if (!a && !snapshots[id]?.unsynced) void c.forget()
        c.destroy()
        connections.delete(id)
        const { [id]: _, ...rest } = snapshots
        snapshots = rest
      }
    const token = storedToken()
    if (!a || !token || !a.salons.length) return
    // Yjs et la synchronisation ne se chargent qu'ici
    const { SalonConnection } =
      await import('../../../lib/parcours/salon/salonConnection')
    for (const s of a.salons)
      if (!connections.has(s.id)) {
        const c = new SalonConnection(s.id, token, a, (snap) => {
          snapshots = { ...snapshots, [s.id]: snap }
        })
        connections.set(s.id, c)
        snapshots = { ...snapshots, [s.id]: c.snapshot() }
      }
  }
  /** État de l'enregistrement d'un salon, affiché à côté de son nom */
  function syncLabel(snap: SalonSnapshot): {
    text: string
    icon: string
    warn: boolean
  } {
    if (snap.status === 'refuse')
      return { text: 'Accès refusé', icon: 'bx-block', warn: true }
    if (snap.status === 'hors-ligne' || snap.status === 'connexion')
      return snap.unsynced
        ? {
            text: 'Hors ligne : modifications gardées dans ce navigateur, envoyées au retour de la connexion',
            icon: 'bx-cloud-off',
            warn: true,
          }
        : {
            text: snap.status === 'connexion' ? 'Connexion…' : 'Hors ligne',
            icon: 'bx-cloud-off',
            warn: snap.status === 'hors-ligne',
          }
    return snap.unsynced
      ? { text: 'Envoi…', icon: 'bx-cloud-upload', warn: false }
      : { text: 'Enregistré', icon: 'bx-cloud', warn: false }
  }
  const unsent = $derived(
    Object.values(snapshots).some((snap) => snap.unsynced > 0),
  )

  // Connecté, on travaille dans le salon : ce navigateur est replié
  let showBrowser = $state(false)
  const salonName = (id: string) =>
    account?.salons.find((s) => s.id === id)?.nom ?? 'Salon'
  const openSalons = $derived(
    (account?.salons ?? []).filter((s) => snapshots[s.id]),
  )
  $effect(() => {
    if (objectivesChosen) return
    if (!openSalons.some((s) => s.id === objectivesSalon))
      objectivesSalon = openSalons[0]?.id ?? null
  })

  // Parcours ouvert : celui de la bibliothèque ou celui du salon
  const salonSnapshot = $derived(
    selectedSalon ? (snapshots[selectedSalon] ?? null) : null,
  )
  const current: Parcours | null = $derived(
    selectedSalon
      ? (salonSnapshot?.parcours.find((p) => p.id === selectedId) ?? null)
      : (selected?.parcours ?? null),
  )
  function changeCurrent(p: Parcours) {
    if (!selectedSalon) return change(p)
    // Parcours nouveau ou copié : il reçoit son identifiant, et on l'ouvre
    const written = connections
      .get(selectedSalon)
      ?.write(p.id ? p : { ...p, id: parcoursId(p.titre) })
    if (written && written.id !== selectedId) select(written.id, selectedSalon)
  }

  // Document ouvert dans un salon : parcours (onglet Parcours) ou fiche
  // (onglet Fiches) ; null pour ce qui est dans ce navigateur
  // (fonctions : les fiches sont déclarées plus bas)
  const openSalon: string | null = $derived.by(() => {
    if (view === 'parcours') return current ? selectedSalon : null
    return view === 'fiches' && shownLesson ? lessonSalon : null
  })
  const openDoc: string | null = $derived.by(() => {
    if (!openSalon) return null
    return view === 'parcours' ? (current?.id ?? null) : lessonDoc
  })
  const openSnap = $derived(openSalon ? (snapshots[openSalon] ?? null) : null)

  // ---------- Mentions « @Nom » : membres du salon, pastilles des mentions pas encore lues ----------
  let members = $state<Record<string, string[]>>({})
  $effect(() => {
    for (const s of openSalons)
      if (!members[s.id])
        salonMembers(s.id)
          .then((m) => (members = { ...members, [s.id]: m.map((x) => x.nom) }))
          .catch(() => {})
  })
  let seen = $state(readSeen())
  const namesOf = (salon: string) => {
    const snap = snapshots[salon]
    return [
      ...(members[salon] ?? []),
      ...(snap?.comments.map((c) => c.auteur) ?? []),
      ...(snap?.messages.map((m) => m.auteur) ?? []),
    ]
  }
  /** Commentaires d'un parcours ou d'une fiche qui me mentionnent, pas encore lus */
  const commentMentions = (salon: string, doc: string) => {
    const snap = snapshots[salon]
    if (!snap || !account) return 0
    return unseenMentions(
      snap.comments.filter((c) => c.parcours === doc),
      account.nom,
      namesOf(salon),
      seen[salon]?.[doc],
    ).length
  }
  const discussionMentions = (salon: string) => {
    const snap = snapshots[salon]
    if (!snap || !account) return 0
    return unseenMentions(
      snap.messages,
      account.nom,
      namesOf(salon),
      seen[salon]?.[DISCUSSION],
    ).length
  }
  const openMentions = $derived(
    openSalon && openDoc
      ? commentMentions(openSalon, openDoc) + discussionMentions(openSalon)
      : 0,
  )
  // Volet ouvert : ce qui s'y affiche est lu, y compris ce qui arrive pendant
  $effect(() => {
    if (!drawerOpen || !openSalon || !openDoc || !openSnap) return
    void openSnap.comments.length
    void openSnap.messages.length
    seen = markSeen(
      seen,
      openSalon,
      drawerTab === 'discussion' ? DISCUSSION : openDoc,
    )
  })

  // Chacun voit ce que les autres ont ouvert et ce qu'ils modifient
  let focusedElement: string | null = $state(null)
  $effect(() => {
    const doc = openDoc
    const element = focusedElement
    for (const [id, c] of connections) {
      c.focus(id === openSalon ? doc : null, id === openSalon ? element : null)
      if (id !== openSalon) c.pointer(null)
    }
  })
  // Deux personnes entrées presque en même temps dans le même élément : celle
  // qui perd la main (ouverture la plus tardive) en sort, clavier compris
  $effect(() => {
    const el = focusedElement
    if (!el || !openSnap || !openDoc) return
    if (lockHolder(openSnap, openDoc, el)) {
      const active = document.activeElement as HTMLElement | null
      if (active?.closest(`[data-element="${CSS.escape(el)}"]`)) active.blur()
      focusedElement = null
    }
  })

  function trackFocus(e: FocusEvent) {
    if (!openSnap || !openDoc) return
    const el = (e.target as Element | null)
      ?.closest('[data-element]')
      ?.getAttribute('data-element')
    if (!el) return (focusedElement = null)
    // Élément modifié par quelqu'un d'autre : on ne peut pas y entrer
    if (lockHolder(openSnap, openDoc, el)) {
      ;(e.target as HTMLElement).blur()
      return
    }
    focusedElement = el
  }
  // Souris au-dessus de l'éditeur : position relative à l'élément survolé
  let editorBox: HTMLElement | undefined = $state()
  let lessonBox: HTMLElement | undefined = $state()
  // Éditeurs : un commentaire peut y montrer son élément
  let parcoursEditor: ReturnType<typeof ParcoursEditor> | undefined = $state()
  let lessonEditor: ReturnType<typeof LessonEditor> | undefined = $state()
  function trackPointer(e: PointerEvent) {
    const c = openSalon ? connections.get(openSalon) : undefined
    const box = e.currentTarget as HTMLElement
    if (!c || e.pointerType === 'touch') return
    const target =
      (e.target as Element | null)?.closest<HTMLElement>('[data-element]') ??
      box
    const r = target.getBoundingClientRect()
    c.pointer({
      element: target === box ? '' : (target.dataset.element ?? ''),
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    })
  }
  function leavePointer() {
    if (openSalon) connections.get(openSalon)?.pointer(null)
  }
  const pointers = $derived(
    openSnap && openDoc
      ? openSnap.presences.filter((p) => p.parcours === openDoc && p.pointeur)
      : [],
  )

  function leaveFocus(e: FocusEvent) {
    const next = e.relatedTarget as Element | null
    if (!next?.closest('[data-element]')) focusedElement = null
  }

  // Volet Discussion / Commentaires
  let drawerOpen = $state(false)
  let drawerTab: 'discussion' | 'commentaires' | 'versions' =
    $state('commentaires')
  let drawerElement: string | null = $state(null)
  const collab: EditorCollab | undefined = $derived.by(() => {
    const snap = openSnap
    const doc = openDoc
    if (!snap || !doc) return undefined
    return {
      lock: (el) => lockHolder(snap, doc, el),
      comments: (el) =>
        snap.comments.filter(
          (c) =>
            c.parcours === doc && c.element === el && !c.parent && !c.resolu,
        ).length,
      oncomment: (el) => {
        drawerElement = el
        drawerTab = 'commentaires'
        drawerOpen = true
      },
    }
  })

  function createInSalon(salon: string) {
    const c = connections.get(salon)
    if (!c) return
    const d = library.defaults
    const p = c.write({
      ...emptyParcours(
        d
          ? {
              niveau: d.niveau,
              difficulte: d.difficulte,
              presentation: d.presentation,
              correction: d.correction,
            }
          : {},
      ),
      id: parcoursId(''),
    })
    view = 'parcours'
    notice = ''
    select(p.id, salon)
    if (sheet.length) addSheet(0)
  }
  function shareInSalon(salon: string) {
    const p = current
    const c = connections.get(salon)
    if (!p || !c) return
    c.write(structuredClone($state.snapshot(p)) as Parcours)
    notice = `« ${p.titre || 'Sans titre'} » est dans le salon « ${salonName(salon)} ». Les modifications faites ici se voient de toute l’équipe ; la version de ce navigateur ne change plus (« Copier dans ce navigateur » la met à jour).`
    select(p.id, salon)
  }
  function copyToBrowser() {
    const p = current
    if (!p) return
    const known = library.entries.some((e) => e.parcours.id === p.id)
    change(structuredClone($state.snapshot(p)) as Parcours)
    notice = known
      ? `« ${p.titre || 'Sans titre'} » est mis à jour dans ce navigateur (classes gardées) : il partira à la prochaine publication.`
      : `« ${p.titre || 'Sans titre'} » est copié dans ce navigateur : il peut être donné aux classes et publié.`
  }
  // ---------- Import de parcours dans un salon (copies) ----------
  let importTo: string | null = $state(null) // salon dont l'import est ouvert
  let importChoice: string[] = $state([]) // parcours de ce navigateur cochés
  let importFile: {
    name: string
    parcours: Parcours[]
    objectives: Objective[]
  } | null = $state(null)
  let importFileChoice: string[] = $state([])
  let importReplace = $state(false)
  function toggleImport(salon: string) {
    importTo = importTo === salon ? null : salon
    importChoice = []
    importFile = null
    importFileChoice = []
    importReplace = false
  }
  async function readImportFile(file: File | undefined) {
    if (!file) return
    try {
      const f = readParcoursFile(await file.text())
      const all = [
        ...f.classes.flatMap((c) => c.parcours),
        ...(f.bibliotheque?.parcours ?? []),
      ]
      const parcours = all.filter(
        (p, i) => all.findIndex((x) => x.id === p.id) === i,
      )
      importFile = {
        name: file.name,
        parcours,
        objectives: f.bibliotheque?.objectifs ?? [],
      }
      importFileChoice = parcours.map((p) => p.id)
    } catch (e) {
      notice = (e as Error).message
    }
  }
  function importIntoSalon(salon: string) {
    const c = connections.get(salon)
    const snap = snapshots[salon]
    if (!c || !snap) return
    const picked = [
      ...library.entries
        .filter((e) => importChoice.includes(e.parcours.id))
        .map((e) => e.parcours),
      ...(importFile?.parcours.filter((p) => importFileChoice.includes(p.id)) ??
        []),
    ].map((p) => JSON.parse(JSON.stringify($state.snapshot(p))) as Parcours)
    const taken = new Set(snap.parcours.map((p) => p.id))
    let copies = 0
    for (const p of picked) {
      // Déjà dans le salon : copie à part, sauf si l'on a choisi de remplacer
      const copy = taken.has(p.id) && !importReplace
      if (copy) copies++
      const written = c.write(
        copy ? { ...p, id: parcoursId(p.titre), titre: `${p.titre} (copie)` } : p,
      )
      taken.add(written.id)
    }
    // Les objectifs de leurs exercices entrent dans la liste du salon
    const used = new Set(
      picked.flatMap((p) => p.etapes.flatMap((s) => s.objectifs ?? [])),
    )
    const added = c.addObjectives(
      mergeObjectives(library.objectives, importFile?.objectives ?? []).filter(
        (o) => used.has(o.libelle),
      ),
    )
    const n = picked.length
    notice = `${n} parcours importé${n > 1 ? 's' : ''} dans le salon « ${salonName(salon)} »${copies ? ` (${copies} en copie, déjà présent${copies > 1 ? 's' : ''})` : ''}${added ? `, ${added} objectif${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''} à sa liste` : ''}. Les originaux ne changent pas.`
    importTo = null
  }

  const viewers = (
    snap: SalonSnapshot | undefined,
    parcoursId?: string,
  ): Presence[] => (snap ? people(snap.presences, parcoursId) : [])
  let index = $state<Map<string, ReferentialExercise> | null>(null)
  let notice = $state('')
  let confirmDelete = $state(false)
  let dropping = $state(false)

  // Référentiel français ou suisse, choisi avec le drapeau de l'en-tête
  const country = $derived(countryOf($referentielLocale))
  const levels = $derived(levelsFor(country))
  $effect(() => {
    const c = country
    exerciseIndex(c).then((i) => {
      if (c === country) index = i
    })
  })
  function setLanguage(lang: string) {
    if (!isLanguage(lang) || lang === $referentielLocale) return
    referentielLocale.set(lang)
    mathaleaUpdateUrlFromExercicesParams()
  }
  // Exercices déjà rangés sous un objectif : ceux du salon pour un parcours du salon
  const tags = $derived(
    taggedExercises(
      (selectedSalon
        ? (salonSnapshot?.parcours ?? [])
        : library.entries.map((e) => e.parcours)
      ).flatMap((p) => p.etapes),
    ),
  )
  const toSend = $derived(unpublishedCount(library))
  const ready = $derived(
    library.entries.filter((e) => !missing(e.parcours).length).length,
  )

  // ---------- Exercices de la feuille composée sur le site ----------
  function stepFrom(params: (typeof $exercicesParams)[number]): Step | null {
    const e = index?.get(params.uuid)
    if (!e || !e.interactif) return null
    const s: Step = {
      uuid: e.uuid,
      id: params.id ?? e.id,
      titre: e.titre,
      nbQuestions: Number(params.nbQuestions) || 3,
    }
    for (const k of ['sup', 'sup2', 'sup3', 'sup4', 'sup5'] as const)
      if (params[k] !== undefined) s[k] = String(params[k])
    const objectifs =
      tags.get(exerciseKey(s)) ??
      (e.objective ? [e.objective.libelle] : undefined)
    return objectifs ? { ...s, objectifs } : s
  }
  const sheet = $derived(
    index
      ? $exercicesParams.map(stepFrom).filter((s): s is Step => s !== null)
      : [],
  )
  const skipped = $derived(index ? $exercicesParams.length - sheet.length : 0)

  function addSheet(level: number) {
    const p = current
    if (!p || !sheet.length) return
    const n = sheet.length
    changeCurrent(addSteps(p, sheet, level))
    exercicesParams.set([])
    notice = `${n} exercice${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''} à « ${p.titre || 'Sans titre'} »${skipped ? ` ; ${skipped} non interactif${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''} (l’application ne propose que des exercices interactifs)` : ''}.`
  }

  onMount(() => {
    if (storedToken())
      me()
        .then(setAccount)
        .catch(() => {})
    const stop = watchAutoSave()
    return () => {
      stop()
      for (const c of connections.values()) c.destroy()
      connections.clear()
    }
  })

  // Parcours modifiés dans un autre onglet (ou fusionnés par la synchronisation) :
  // on repart de la dernière version. L'événement ne vient jamais de cet onglet.
  function reloadFromOtherTab(event: StorageEvent) {
    if (event.key !== PARCOURS_KEY && event.key !== null) return
    library = loadParcoursSettings().library
    if (!library.entries.some((e) => e.parcours.id === selectedId)) {
      selectedId = null
    }
  }

  // ---------- Bibliothèque ----------
  function change(p: Parcours) {
    const r = saveParcours(library, p)
    library = r.library
    selectedId = r.id
  }

  function create() {
    const d = library.defaults
    change(
      emptyParcours(
        d
          ? {
              niveau: d.niveau,
              difficulte: d.difficulte,
              presentation: d.presentation,
              correction: d.correction,
              // Anciennes valeurs par défaut, sans ces champs : ceux d'un nouveau parcours
              ...(d.enTetesMasques === undefined
                ? {}
                : { enTetesMasques: d.enTetesMasques }),
              ...(d.melanger === undefined ? {} : { melanger: d.melanger }),
            }
          : {},
      ),
    )
    view = 'parcours'
    notice = ''
    // Avec la feuille du site en cours, ses exercices entrent dans le nouveau parcours
    if (sheet.length) addSheet(0)
  }

  async function open(file: File | undefined) {
    if (!file) return
    try {
      const f = readParcoursFile(await file.text())
      library = restore(library, f)
      const ids = new Set(
        [
          ...f.classes.flatMap((c) => c.parcours),
          ...(f.bibliotheque?.parcours ?? []),
        ].map((p) => p.id),
      )
      notice = `${ids.size} parcours repris${f.classes.length ? `, ${f.classes.length} classe${f.classes.length > 1 ? 's' : ''}` : ''}. Rien n’a été effacé.`
    } catch (e) {
      notice = (e as Error).message
    }
  }

  // Fiche ouverte : seule (ouverte depuis un fichier, jamais gardée par le
  // site), d'un parcours de ce navigateur, ou d'un salon (seule ou d'un parcours)
  type LessonSource =
    | { kind: 'navigateur'; id: string; level: number | null }
    | { kind: 'salon'; salon: string; id: string }
    | { kind: 'salon-parcours'; salon: string; id: string; level: number | null }
  let lesson: Lesson | null = $state(null)
  let lessonSource = $state<LessonSource | null>(null)
  let confirmLessonDelete = $state(false)
  const fichesOf = (p: Parcours, level: number | null) =>
    level === null ? p.fiche : p.paliers?.[level]?.fiche
  /** Fiches des parcours (palier par palier), parcours sans fiche écartés */
  const lessonsOf = (list: Parcours[]) =>
    list
      .map((parcours) => ({
        parcours,
        lessons: [
          ...(parcours.fiche
            ? [{ level: null, label: 'Parcours', fiche: parcours.fiche }]
            : []),
          ...(parcours.paliers ?? []).flatMap((l, i) =>
            l.fiche
              ? [
                  {
                    level: i,
                    label: l.titre || `Palier ${i + 1}`,
                    fiche: l.fiche,
                  },
                ]
              : [],
          ),
        ],
      }))
      .filter((g) => g.lessons.length)
  const parcoursLessons = $derived(
    lessonsOf(library.entries.map((e) => e.parcours)),
  )
  // Fiche d'un salon : toujours celle du salon, modifiée par toute l'équipe
  const lessonSalon = $derived(
    lessonSource && lessonSource.kind !== 'navigateur'
      ? lessonSource.salon
      : null,
  )
  const lessonDoc = $derived(
    lessonSource?.kind === 'salon'
      ? lessonDocId(lessonSource.id)
      : lessonSource?.kind === 'salon-parcours'
        ? lessonDocId(lessonSource.id, lessonSource.level)
        : null,
  )
  const shownLesson: Lesson | null = $derived.by(() => {
    const src = lessonSource
    if (!src || src.kind === 'navigateur') return lesson
    const snap = snapshots[src.salon]
    if (!snap) return null
    if (src.kind === 'salon')
      return snap.fiches.find((f) => f.id === src.id)?.fiche ?? null
    const p = snap.parcours.find((x) => x.id === src.id)
    return (p && fichesOf(p, src.level)) ?? null
  })
  function openSource(src: LessonSource | null, l: Lesson | null = null) {
    lessonSource = src
    lesson = l
    confirmLessonDelete = false
    drawerOpen = false
    notice = ''
  }
  function editParcoursLesson(id: string, level: number | null) {
    const p = library.entries.find((e) => e.parcours.id === id)?.parcours
    const fiche = p && fichesOf(p, level)
    if (!fiche) return
    openSource(
      { kind: 'navigateur', id, level },
      JSON.parse(JSON.stringify($state.snapshot(fiche))),
    )
  }
  /** Fiche mise à la place d'une autre dans un parcours (copie modifiée) */
  function withLesson(p: Parcours, level: number | null, l: Lesson) {
    const copy: Parcours = JSON.parse(JSON.stringify($state.snapshot(p)))
    if (level === null) copy.fiche = l
    else if (copy.paliers?.[level]) copy.paliers[level].fiche = l
    else return null
    return copy
  }
  function lessonChanged(l: Lesson) {
    const src = lessonSource
    if (!src) {
      lesson = l
      return
    }
    if (src.kind === 'navigateur') {
      lesson = l
      const p = library.entries.find((e) => e.parcours.id === src.id)?.parcours
      const copy = p && withLesson(p, src.level, l)
      if (copy) change(copy)
      return
    }
    const c = connections.get(src.salon)
    if (!c) return
    if (src.kind === 'salon') c.writeLesson(src.id, l)
    else {
      const p = snapshots[src.salon]?.parcours.find((x) => x.id === src.id)
      const copy = p && withLesson(p, src.level, l)
      if (copy) c.write(copy)
    }
  }
  const sourceLabel = $derived.by(() => {
    const src = lessonSource
    if (!src || src.kind === 'salon') return ''
    const list =
      src.kind === 'navigateur'
        ? library.entries.map((e) => e.parcours)
        : (snapshots[src.salon]?.parcours ?? [])
    const p = list.find((x) => x.id === src.id)
    if (!p) return ''
    const level =
      src.level === null
        ? ''
        : `, ${p.paliers?.[src.level]?.titre || `palier ${src.level + 1}`}`
    return `${p.titre || 'Sans titre'}${level}`
  })
  async function openLesson(file: File | undefined) {
    if (!file) return
    try {
      openSource(null, readLessonFile(await file.text()))
    } catch (e) {
      notice = (e as Error).message
    }
  }
  /** Fiche seule ajoutée à un salon (nouvelle, importée ou copiée), puis ouverte */
  function lessonToSalon(salon: string, l: Lesson) {
    const c = connections.get(salon)
    if (!c) return
    const id = newKey()
    c.writeLesson(id, JSON.parse(JSON.stringify($state.snapshot(l))))
    openSource({ kind: 'salon', salon, id })
    view = 'fiches'
  }
  async function importLessonToSalon(salon: string, file: File | undefined) {
    if (!file) return
    try {
      lessonToSalon(salon, readLessonFile(await file.text()))
      notice = `Fiche importée dans le salon « ${salonName(salon)} ».`
    } catch (e) {
      notice = (e as Error).message
    }
  }
  /** Fiche seule du salon rattachée à un palier d'un parcours du salon (copie) */
  function attachLesson(target: string) {
    const src = lessonSource
    const l = shownLesson
    if (!src || src.kind !== 'salon' || !l) return
    const [id, at] = target.split('|')
    const level = at === 'parcours' ? null : Number(at)
    const p = snapshots[src.salon]?.parcours.find((x) => x.id === id)
    const copy = p && withLesson(p, level, l)
    if (!copy) return
    connections.get(src.salon)?.write(copy)
    openSource({ kind: 'salon-parcours', salon: src.salon, id, level })
    notice = `Fiche copiée dans « ${p.titre || 'Sans titre'} »${level === null ? '' : ` (${levelName(p, level).toLowerCase()})`} : c’est cette copie qui part aux élèves. La fiche seule reste dans le salon.`
  }
  /** Emplacements d'un parcours du salon pour une fiche : le parcours ou chaque palier */
  const lessonSlots = (p: Parcours) =>
    p.paliers?.length
      ? p.paliers.map((l, i) => ({
          value: `${p.id}|${i}`,
          label: `${levelName(p, i)}${l.titre ? ` · ${l.titre}` : ''}${l.fiche ? ` (remplace « ${l.fiche.titre || 'Sans titre'} »)` : ''}`,
        }))
      : [
          {
            value: `${p.id}|parcours`,
            label: `Tout le parcours${p.fiche ? ` (remplace « ${p.fiche.titre || 'Sans titre'} »)` : ''}`,
          },
        ]
  async function saveLesson() {
    const l = shownLesson
    if (!l) return
    const name = lessonFileName(l)
    notice =
      (await downloadFile(createLessonFile(l), name)) === 'success'
        ? `${name} enregistré. Pour qu’elle arrive aux élèves, ajoutez-la à un palier dans l’onglet Parcours (« Importer une fiche »), puis publiez.`
        : 'Le fichier n’a pas pu être enregistré.'
  }

  async function publishLibrary() {
    const { text, library: published } = publish(library)
    const name = timestampedName('parcours-mathalea')
    if ((await downloadFile(text, name)) === 'success') {
      library = published
      notice = `${name} enregistré : déposez-le dans le dossier partagé de vos classes (les anciens peuvent y rester). Les élèves le reçoivent au prochain lancement de l’application.`
    } else notice = 'Le fichier n’a pas pu être enregistré.'
  }

  const byLevel = $derived.by(() => {
    const rank = (n: string) =>
      ALL_LEVELS.indexOf(n) === -1 ? ALL_LEVELS.length : ALL_LEVELS.indexOf(n)
    const lv = [...new Set(library.entries.map((e) => e.parcours.niveau))].sort(
      (a, b) => rank(a) - rank(b),
    )
    return lv.map((niveau) => {
      const of = library.entries.filter((e) => e.parcours.niveau === niveau)
      return {
        niveau,
        chapters: [...new Set(of.map((e) => e.parcours.theme.trim()))].map(
          (theme) => ({
            theme,
            entries: of.filter((e) => e.parcours.theme.trim() === theme),
          }),
        ),
      }
    })
  })

  const summary = (e: (typeof library.entries)[number]) => {
    const levelsCount = levelGroups(e.parcours).length
    const n = e.parcours.etapes.length
    const organisation =
      levelsCount > 1
        ? e.parcours.style === 'ceintures'
          ? `${levelsCount} ceintures`
          : `${levelsCount} paliers`
        : `${n} exercice${n > 1 ? 's' : ''}`
    return [
      e.classes.length ? e.classes.join(', ') : 'Aucune classe',
      organisation,
    ].join(' · ')
  }

  const tab = (on: boolean) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
      on
        ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-struct dark:text-coopmathsdark-struct shadow-sm'
        : 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light hover:text-coopmaths-struct dark:hover:text-coopmathsdark-struct'
    }`
  const primary =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest disabled:opacity-40'
  const secondary =
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-action hover:text-coopmaths-canvas dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas cursor-pointer'
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const selectClass =
    'rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-2 py-1'
  const card =
    'w-full h-full flex flex-row items-start gap-3 rounded-xl p-4 text-left border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:border-coopmaths-action dark:hover:border-coopmathsdark-action transition-colors'
</script>

<!-- Connecté : ce qui est dans ce navigateur (non partagé) reste replié -->
{#snippet browserToggle(text: string)}
  <button
    type="button"
    class="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 pt-4 -mb-2 text-left border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    aria-expanded={showBrowser}
    onclick={() => (showBrowser = !showBrowser)}
  >
    <span
      class="inline-flex items-center gap-2 text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      ><i
        class="bx {showBrowser ? 'bx-chevron-down' : 'bx-chevron-right'}"
        aria-hidden="true"
      ></i><i class="bx bx-laptop" aria-hidden="true"></i> Dans ce navigateur</span
    >
    <span class={quiet}>{text}</span>
  </button>
{/snippet}

{#snippet syncBadge(snap: SalonSnapshot)}
  {#if snap.status !== 'connecte' || snap.unsynced}
    {@const sync = syncLabel(snap)}
    <span
      class="inline-flex items-center gap-1 text-sm font-normal {sync.warn
        ? 'text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark'
        : 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'}"
      ><i class="bx {sync.icon}" aria-hidden="true"></i>{sync.text}</span
    >
  {/if}
{/snippet}

{#snippet lessonGroup(
  group: ReturnType<typeof lessonsOf>[number],
  onopen: (level: number | null) => void,
)}
  <div class="flex flex-col gap-2">
    <h3 class="font-bold">
      {group.parcours.titre || 'Sans titre'}
    </h3>
    <ul class="flex flex-col gap-1">
      {#each group.lessons as l (l.level ?? 'parcours')}
        <li>
          <button
            type="button"
            class="text-left underline-offset-2 hover:underline text-coopmaths-action dark:text-coopmathsdark-action"
            onclick={() => onopen(l.level)}
            >{l.fiche.titre && l.fiche.titre !== l.label
              ? `${l.label} : ${l.fiche.titre}`
              : l.fiche.titre || l.label}</button
          >
        </li>
      {/each}
    </ul>
  </div>
{/snippet}

<!-- Mentions « @Nom » pas encore lues -->
{#snippet mentionBadge(n: number, where: string)}
  {#if n}<span
      class="shrink-0 ml-1 rounded-full px-1.5 text-xs font-bold bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas"
      title="Vous êtes mentionné{where}"
      aria-label="{n} mention{n > 1 ? 's' : ''} pour vous{where}">@{n}</span
    >{/if}
{/snippet}

{#snippet avatars(list: Presence[])}
  {#if list.length}
    <span class="inline-flex flex-row -space-x-1.5">
      {#each list.slice(0, 5) as p (p.clientId)}
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ring-2 ring-coopmaths-canvas dark:ring-coopmathsdark-canvas"
          style="background-color: {p.couleur}"
          title={p.nom}>{initials(p.nom)}</span
        >
      {/each}
      {#if list.length > 5}<span
          class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest ring-2 ring-coopmaths-canvas dark:ring-coopmathsdark-canvas"
          >+{list.length - 5}</span
        >{/if}
    </span>
  {/if}
{/snippet}

<svelte:window
  onbeforeunload={(e) => {
    // Modifications d'un salon pas encore reçues par le serveur : on prévient
    // (elles restent gardées dans ce navigateur et partiront à la prochaine visite)
    if (unsent) e.preventDefault()
  }}
  onclick={() => (accountOpen = false)}
  onkeydown={(e) => {
    if (e.key === 'Escape') accountOpen = false
  }}
  onstorage={reloadFromOtherTab}
  ondragover={(e) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault()
      dropping = true
    }
  }}
  ondragleave={(e) => {
    if (!e.relatedTarget) dropping = false
  }}
  ondrop={(e) => {
    dropping = false
    const file = e.dataTransfer?.files[0]
    if (file && !e.defaultPrevented) {
      e.preventDefault()
      if (view === 'fiches') openLesson(file)
      else open(file)
    }
  }}
/>

<div
  class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <NavBar
    subtitle="Parcours pour l’application"
    subtitleType="export"
    handleLanguage={setLanguage}
    locale={$referentielLocale}
  />

  <div
    class="sticky top-0 z-10 flex flex-row flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <div
      class="flex flex-row gap-1 rounded-lg p-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      role="tablist"
      aria-label="Vue"
    >
      {#each [['parcours', 'Parcours'], ['classes', 'Classes'], ['objectifs', 'Objectifs'], ['fiches', 'Fiches']] as [v, text] (v)}
        <button
          type="button"
          role="tab"
          aria-selected={view === v}
          class={tab(view === v)}
          onclick={() => (view = v as View)}>{text}</button
        >
      {/each}
    </div>
    <div class="flex flex-row flex-wrap items-center gap-3">
      <span class={quiet} role="status">
        {#if toSend}
          <i
            class="bx bx-error-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
            aria-hidden="true"
          ></i>
          {toSend === 1
            ? 'Un parcours n’est pas encore publié'
            : `${toSend} parcours ne sont pas encore publiés`}
        {:else if ready}
          <i
            class="bx bx-check-circle text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i> Aucun changement depuis la dernière publication
        {/if}
      </span>
      <label
        class={secondary}
        title="Fichier parcours-mathalea publié par l’application ou par cette page"
      >
        <i class="bx bx-folder-open" aria-hidden="true"></i> Ouvrir
        <input
          type="file"
          accept=".json,application/json"
          class="hidden"
          onchange={(e) => {
            const input = e.currentTarget as HTMLInputElement
            open(input.files?.[0])
            input.value = ''
          }}
        />
      </label>
      <button
        type="button"
        class={primary}
        disabled={!ready}
        onclick={publishLibrary}
      >
        <i class="bx bx-upload" aria-hidden="true"></i> Publier
      </button>
      <!-- Compte des salons : connexion, salons, mot de passe -->
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div class="relative" onclick={(e) => e.stopPropagation()}>
        <button
          type="button"
          class={account
            ? 'inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
            : secondary}
          aria-expanded={accountOpen}
          onclick={() => {
            accountOpen = !accountOpen
            // Le volet de discussion couvrirait le menu du compte
            if (accountOpen) drawerOpen = false
          }}
        >
          {#if account}
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
              style="background-color: {colorOf(account.id)}"
              >{initials(account.nom)}</span
            >
            <span class="hidden md:inline">{account.nom}</span>
          {:else}
            <i class="bx bx-log-in" aria-hidden="true"></i> Se connecter
          {/if}
        </button>
        {#if accountOpen}
          <div
            class="absolute right-0 top-full mt-2 z-40 w-[30rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl p-4 shadow-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            <SalonPanel
              {account}
              {invitation}
              onaccount={(a) => {
                const wasAnonymous = account === null
                void setAccount(a)
                if (a && invitation) {
                  // Invitation utilisée : le lien ne la repropose plus
                  const url = new URL(window.location.href)
                  url.searchParams.delete('invitation')
                  history.replaceState(history.state, '', url)
                }
                if (a && wasAnonymous) accountOpen = false
              }}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if dropping}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-coopmaths-canvas/90 dark:bg-coopmathsdark-canvas/90 pointer-events-none"
    >
      <p
        class="rounded-xl border-2 border-dashed border-coopmaths-action dark:border-coopmathsdark-action px-10 py-8 text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        {view === 'fiches'
          ? 'Déposez le fichier de la fiche pour la modifier'
          : 'Déposez le fichier publié pour reprendre la bibliothèque'}
      </p>
    </div>
  {/if}

  <main
    class="flex-1 w-full {view === 'parcours' && current && display === 'split'
      ? ''
      : 'max-w-screen-xl'} mx-auto px-4 md:px-8 py-6 flex flex-col gap-6"
  >
    {#if notice}
      <p
        class="flex flex-row items-start gap-3 rounded-lg px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        role="status"
      >
        <span class="flex-1">{notice}</span>
        <button
          type="button"
          class="text-coopmaths-action dark:text-coopmathsdark-action"
          aria-label="Fermer le message"
          onclick={() => (notice = '')}
          ><i class="bx bx-x text-xl" aria-hidden="true"></i></button
        >
      </p>
    {/if}

    {#if !library.entries.length && !openSalons.length && view === 'parcours'}
      <!-- Mise en route : rien dans la bibliothèque -->
      <section
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-label="Mise en route"
      >
        {#each [['bx-layer', 'Créer', 'Un parcours pour un niveau : exercices du site, paliers, pauses, objectifs.'], ['bx-group', 'Donner aux classes', 'Chaque classe reçoit ses parcours, dans l’ordre choisi.'], ['bx-upload', 'Publier', 'Un fichier à déposer dans le dossier partagé : les applications des élèves le lisent.']] as [icon, title, text], k (title)}
          <div
            class="flex flex-col gap-2 rounded-xl p-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            <span
              class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas"
                >{k + 1}</span
              >
              <i class="bx {icon} text-xl" aria-hidden="true"></i>{title}
            </span>
            <p class={quiet}>{text}</p>
          </div>
        {/each}
      </section>
      <div class="flex flex-row flex-wrap items-center gap-4">
        <button type="button" class={primary} onclick={create}
          ><i class="bx bx-plus" aria-hidden="true"></i> Créer un parcours{sheet.length
            ? ` avec la feuille en cours (${sheet.length})`
            : ''}</button
        >
        <span class={quiet}
          >ou déposez ici le fichier déjà publié (application ou site) pour
          reprendre votre bibliothèque.</span
        >
      </div>
    {:else if view === 'parcours' && !current}
      <!-- Entrée : choisir le parcours à modifier, ou en créer un -->
      <div class="flex flex-row flex-wrap items-center justify-between gap-3">
        <h2
          class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Mes parcours
        </h2>
        {#if !openSalons.length}
          <button type="button" class={primary} onclick={create}
            ><i class="bx bx-plus" aria-hidden="true"></i> Nouveau parcours{sheet.length
              ? ` avec la feuille en cours (${sheet.length})`
              : ''}</button
          >
        {/if}
      </div>
      {#each openSalons as salon (salon.id)}
        {@const snap = snapshots[salon.id]}
        <section class="flex flex-col gap-3" aria-label="Salon {salon.nom}">
          <div
            class="flex flex-row flex-wrap items-center justify-between gap-3"
          >
            <h3
              class="flex flex-row flex-wrap items-center gap-3 text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              <i class="bx bx-group" aria-hidden="true"></i>
              {salon.nom}
              {@render syncBadge(snap)}
              {@render avatars(viewers(snap))}
              {@render mentionBadge(
                discussionMentions(salon.id),
                ' dans la discussion',
              )}
            </h3>
            <div class="flex flex-row flex-wrap items-center gap-3">
              <button
                type="button"
                class={secondary}
                aria-expanded={importTo === salon.id}
                onclick={() => toggleImport(salon.id)}
                ><i class="bx bx-import" aria-hidden="true"></i> Importer</button
              >
              <button
                type="button"
                class={primary}
                onclick={() => createInSalon(salon.id)}
                ><i class="bx bx-plus" aria-hidden="true"></i> Nouveau parcours
                dans le salon{sheet.length
                  ? ` avec la feuille en cours (${sheet.length})`
                  : ''}</button
              >
            </div>
          </div>
          {#if importTo === salon.id}
            {@const taken = new Set(snap.parcours.map((p) => p.id))}
            {@const count =
              importChoice.length +
              (importFile ? importFileChoice.length : 0)}
            {@const clash = [
              ...importChoice,
              ...(importFile ? importFileChoice : []),
            ].some((id) => taken.has(id))}
            <div
              class="flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
              role="group"
              aria-label="Importer dans le salon"
            >
              <p class={quiet}>
                Les parcours choisis sont copiés dans le salon, avec leurs
                fiches et les objectifs de leurs exercices. Les originaux ne
                changent pas.
              </p>
              {#snippet choices(list: Parcours[], chosen: string[], set: (ids: string[]) => void)}
                <ul class="flex flex-col gap-1">
                  {#each list as p (p.id)}
                    <li>
                      <label class="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={chosen.includes(p.id)}
                          onchange={(e) =>
                            set(
                              e.currentTarget.checked
                                ? [...chosen, p.id]
                                : chosen.filter((x) => x !== p.id),
                            )}
                        />
                        <span>{p.titre || 'Sans titre'}</span>
                        <span class={quiet}
                          >{[
                            p.niveau,
                            p.theme.trim(),
                            taken.has(p.id) ? 'déjà dans le salon' : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}</span
                        >
                      </label>
                    </li>
                  {/each}
                </ul>
              {/snippet}
              {#if library.entries.length}
                <span class="font-semibold">Mes parcours (ce navigateur)</span>
                {@render choices(
                  library.entries.map((e) => e.parcours),
                  importChoice,
                  (ids) => (importChoice = ids),
                )}
              {/if}
              {#if importFile}
                <span class="font-semibold">{importFile.name}</span>
                {@render choices(
                  importFile.parcours,
                  importFileChoice,
                  (ids) => (importFileChoice = ids),
                )}
              {/if}
              <label class="{link} self-start cursor-pointer">
                <i class="bx bx-folder-open" aria-hidden="true"></i>
                {importFile ? 'Un autre fichier' : 'Depuis un fichier'} (parcours-mathalea…)
                <input
                  type="file"
                  accept=".json,application/json"
                  class="hidden"
                  onchange={(e) => {
                    readImportFile(e.currentTarget.files?.[0])
                    e.currentTarget.value = ''
                  }}
                />
              </label>
              {#if clash}
                <fieldset class="flex flex-row flex-wrap gap-x-6 gap-y-1 text-sm">
                  <legend class="mb-1 font-semibold">Déjà dans le salon</legend>
                  <label class="inline-flex items-center gap-2"
                    ><input
                      type="radio"
                      checked={!importReplace}
                      onchange={() => (importReplace = false)}
                    /> En faire une copie</label
                  >
                  <label class="inline-flex items-center gap-2"
                    ><input
                      type="radio"
                      checked={importReplace}
                      onchange={() => (importReplace = true)}
                    /> Remplacer la version du salon</label
                  >
                </fieldset>
              {/if}
              <div class="flex flex-row flex-wrap items-center gap-3">
                <button
                  type="button"
                  class={primary}
                  disabled={!count}
                  onclick={() => importIntoSalon(salon.id)}
                  >Importer{count ? ` (${count})` : ''}</button
                >
                <button
                  type="button"
                  class={link}
                  onclick={() => (importTo = null)}>Annuler</button
                >
              </div>
            </div>
          {/if}
          {#if !snap.parcours.length}
            <p class={quiet}>
              Aucun parcours. Importez-en, ou créez-en un.
            </p>
          {/if}
          <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {#each snap.parcours as p (p.id)}
              <li>
                <button
                  type="button"
                  class="w-full h-full flex flex-row items-start gap-3 rounded-xl p-4 text-left border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:border-coopmaths-action dark:hover:border-coopmathsdark-action transition-colors"
                  onclick={() => select(p.id, salon.id)}
                >
                  <i
                    class="bx {p.icone} text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct"
                    aria-hidden="true"
                  ></i>
                  <span class="min-w-0 flex-1">
                    <span
                      class="block font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                      >{p.titre || 'Sans titre'}</span
                    >
                    <span class="block {quiet}"
                      >{[
                        p.niveau,
                        p.theme.trim(),
                        `${p.etapes.length} exercice${p.etapes.length > 1 ? 's' : ''}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}</span
                    >
                  </span>
                  {@render avatars(viewers(snap, p.id))}
                  {@render mentionBadge(
                    commentMentions(salon.id, p.id),
                    ' dans ses commentaires',
                  )}
                </button>
              </li>
            {/each}
          </ul>
          <DeletedParcours
            salon={salon.id}
            current={snap.parcours}
            onrestore={(p) => connections.get(salon.id)?.write(p)}
          />
        </section>
      {/each}
      {#if openSalons.length && library.entries.length}
        {@render browserToggle(
          `${library.entries.length} parcours, non partagés avec l’équipe`,
        )}
        {#if showBrowser}
          <div class="flex flex-row flex-wrap items-center gap-3">
            <button type="button" class={secondary} onclick={create}
              ><i class="bx bx-plus" aria-hidden="true"></i> Nouveau parcours dans
              ce navigateur</button
            >
          </div>
        {/if}
      {/if}
      {#if !openSalons.length || showBrowser}
      {#each byLevel as g (g.niveau)}
        <section
          class="flex flex-col gap-2"
          aria-label={g.niveau || 'Sans niveau'}
        >
          <h3
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {g.niveau || 'Sans niveau'}
          </h3>
          {#each g.chapters as c (c.theme)}
            <p
              class="mt-1 text-xs font-semibold uppercase tracking-wide text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
            >
              {c.theme || 'Sans chapitre'}
            </p>
            <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {#each c.entries as e (e.parcours.id)}
                <li>
                  <button
                    type="button"
                    class="w-full h-full flex flex-row items-start gap-3 rounded-xl p-4 text-left border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:border-coopmaths-action dark:hover:border-coopmathsdark-action transition-colors"
                    onclick={() => select(e.parcours.id)}
                  >
                    <i
                      class="bx {e.parcours
                        .icone} text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct"
                      aria-hidden="true"
                    ></i>
                    <span class="min-w-0">
                      <span
                        class="flex flex-row items-center gap-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                      >
                        {e.parcours.titre || 'Sans titre'}
                        {#if toPublish(e)}<span
                            class="shrink-0 w-2 h-2 rounded-full bg-coopmaths-warn-dark dark:bg-coopmathsdark-warn-dark"
                            title="Pas encore publié"
                          ></span>{/if}
                      </span>
                      <span class="block {quiet}">{summary(e)}</span>
                    </span>
                  </button>
                </li>
              {/each}
            </ul>
          {/each}
        </section>
      {/each}
      {/if}
    {:else if view === 'parcours' && current}
      <div class="flex flex-row flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1 font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
          onclick={() => select(null)}
          ><i class="bx bx-arrow-back text-xl" aria-hidden="true"></i> Mes parcours</button
        >
        {#if selectedSalon && salonSnapshot}
          {@const sync = syncLabel(salonSnapshot)}
          <span class="flex flex-row flex-wrap items-center gap-3">
            <span class={quiet}
              ><i class="bx bx-group" aria-hidden="true"></i> Salon « {salonName(
                selectedSalon,
              )} »</span
            >
            <span
              class="inline-flex items-center gap-1 text-sm {sync.warn
                ? 'text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark'
                : 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'}"
              role="status"
              ><i class="bx {sync.icon}" aria-hidden="true"
              ></i>{sync.text}</span
            >
            {@render avatars(viewers(salonSnapshot, current.id))}
            <button
              type="button"
              class="inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest"
              onclick={() => {
                drawerElement = null
                // Depuis l'onglet Versions : on passe aux commentaires
                if (drawerTab === 'versions') {
                  drawerTab = 'commentaires'
                  drawerOpen = true
                } else drawerOpen = !drawerOpen
              }}
              ><i class="bx bx-message-square-detail" aria-hidden="true"></i> Discussion
              et commentaires{@render mentionBadge(openMentions, '')}</button
            >
            <button
              type="button"
              class="inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest"
              onclick={() => {
                drawerOpen = !(drawerOpen && drawerTab === 'versions')
                drawerTab = 'versions'
              }}
              ><i class="bx bx-history" aria-hidden="true"></i> Versions</button
            >
            <button
              type="button"
              class="inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest"
              title="Pour le donner aux classes et le publier"
              onclick={copyToBrowser}
              ><i class="bx bx-download" aria-hidden="true"></i> Copier dans ce navigateur</button
            >
          </span>
        {:else if openSalons.length}
          <span
            class="inline-flex items-center gap-1 text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
            ><i class="bx bx-laptop" aria-hidden="true"></i> Dans ce navigateur
            : l’équipe ne le voit pas</span
          >
          <label class="flex flex-row items-center gap-2 text-sm">
            <i
              class="bx bx-share-alt text-coopmaths-action dark:text-coopmathsdark-action"
              aria-hidden="true"
            ></i>
            <select
              class="rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-2 py-1"
              value=""
              onchange={(e) => {
                const id = e.currentTarget.value
                e.currentTarget.value = ''
                if (id) shareInSalon(id)
              }}
            >
              <option value="">Partager dans un salon…</option>
              {#each openSalons as salon (salon.id)}<option value={salon.id}
                  >{salon.nom}</option
                >{/each}
            </select>
          </label>
        {/if}
        <!-- Mêmes modes que la vue Typst : éditeur, côte à côte, aperçu -->
        <div
          class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
          role="group"
          aria-label="Mode d'affichage"
        >
          {#each [{ mode: 'edit', icon: 'bx-edit', label: 'Édition' }, { mode: 'split', icon: 'bx-columns', label: 'Côte à côte' }, { mode: 'preview', icon: 'bx-show', label: 'Aperçu élève' }] as choice (choice.mode)}
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-1 text-sm {choice.mode ===
              'split'
                ? 'hidden lg:flex'
                : ''} {display === choice.mode
                ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
              aria-pressed={display === choice.mode}
              onclick={() => setDisplay(choice.mode as Display)}
            >
              <i class="bx {choice.icon} text-lg" aria-hidden="true"></i>
              {choice.label}
            </button>
          {/each}
        </div>
      </div>
      {#if confirmDelete}
        <div
          class="flex flex-row flex-wrap items-center gap-4 rounded-lg p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          role="alert"
        >
          <span
            >{#if selectedSalon}Supprimer « {current.titre || 'Sans titre'} » du salon,
              pour toute l’équipe ? Les copies faites dans les navigateurs restent.{:else}Supprimer
              « {current.titre || 'Sans titre'} » de la bibliothèque ? Les élèves
              le gardent jusqu’à la prochaine publication.{/if}</span
          >
          <button
            type="button"
            class={primary}
            onclick={() => {
              if (selectedSalon)
                connections.get(selectedSalon)?.remove(current.id)
              else library = deleteParcours(library, current.id)
              select(null)
              confirmDelete = false
            }}>Supprimer</button
          >
          <button
            type="button"
            class={secondary}
            onclick={() => (confirmDelete = false)}>Annuler</button
          >
        </div>
      {/if}
      <div
        class="grid grid-cols-1 gap-8 {display === 'split'
          ? 'lg:grid-cols-2'
          : display === 'edit'
            ? 'lg:grid-cols-[13rem_minmax(0,1fr)]'
            : ''}"
      >
        {#if display === 'edit'}
          <aside class="hidden lg:block min-w-0">
            <div
              class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1"
            >
              <ParcoursSchema
                parcours={current}
                onfocus={(anchor) =>
                  document
                    .getElementById(anchor)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            </div>
          </aside>
        {/if}
        <section
          class="relative min-w-0"
          aria-label="Éditeur du parcours"
          hidden={display === 'preview'}
          bind:this={editorBox}
          onfocusin={trackFocus}
          onfocusout={leaveFocus}
          onpointermove={trackPointer}
          onpointerleave={leavePointer}
        >
          {#if pointers.length}
            <SalonPointers presences={pointers} container={editorBox} />
          {/if}
          {#key `${selectedSalon}/${current.id}`}
            <ParcoursEditor
              bind:this={parcoursEditor}
              parcours={current}
              {levels}
              chapters={knownChapters(library, current.niveau)}
              objectives={selectedSalon
                ? (salonSnapshot?.objectives ?? [])
                : library.objectives}
              {tags}
              {index}
              sheetCount={sheet.length}
              fromSite={stepFrom}
              onchange={changeCurrent}
              onaddsheet={addSheet}
              onduplicate={() => changeCurrent(duplicate(current))}
              ondelete={() => (confirmDelete = true)}
              onpreview={() =>
                setDisplay(window.innerWidth >= 1024 ? 'split' : 'preview')}
              onobjectives={() => {
                objectivesSalon = selectedSalon
                objectivesChosen = true
                view = 'objectifs'
              }}
              {collab}
            />
          {/key}
        </section>
        {#if display !== 'edit'}
          <section
            class="min-w-0 {display === 'split'
              ? 'lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]'
              : 'w-full max-w-3xl mx-auto min-h-[70vh]'} overflow-y-auto rounded-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
            aria-label="Aperçu élève"
          >
            {#key `${selectedSalon}/${current.id}`}
              <ParcoursPlayer parcours={current} />
            {/key}
          </section>
        {/if}
      </div>
    {:else if view === 'classes'}
      <ParcoursClasses
        {library}
        onselect={(id) => {
          selectedId = id
          view = 'parcours'
        }}
        onsetparcours={(c, ids) =>
          (library = setClassParcours(library, c, ids))}
        onmove={(id, c, d) => (library = move(library, id, c, d))}
        onadd={(name) => (library = addClass(library, name))}
        onrename={(before, after) =>
          (library = renameClass(library, before, after))}
        onremove={(name) => (library = removeClass(library, name))}
      />
    {:else if view === 'fiches'}
      <section class="flex flex-col gap-4" aria-label="Fiche de cours">
        <div class="flex flex-row flex-wrap items-center gap-3">
          <!-- Fiches hors salon : connecté, seulement si l'on a déplié ce navigateur -->
          {#if !openSalons.length || showBrowser}
          <button
            type="button"
            class={shownLesson || openSalons.length ? secondary : primary}
            onclick={() => openSource(null, emptyLesson())}
            ><i class="bx bx-plus" aria-hidden="true"></i> Nouvelle fiche{openSalons.length
              ? ' dans ce navigateur'
              : ''}</button
          >
          <label class={secondary}>
            <i class="bx bx-folder-open" aria-hidden="true"></i> Ouvrir une
            fiche
            <input
              type="file"
              accept=".json,application/json"
              class="hidden"
              onchange={(e) => {
                openLesson(e.currentTarget.files?.[0])
                e.currentTarget.value = ''
              }}
            />
          </label>
          {/if}
          {#if shownLesson}
            <button type="button" class={primary} onclick={saveLesson}
              ><i class="bx bx-download" aria-hidden="true"></i> Télécharger la fiche</button
            >
          {/if}
        </div>
        {#if shownLesson && lessonSource}
          <div class="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              class={secondary}
              onclick={() => openSource(null)}
              ><i class="bx bx-arrow-back" aria-hidden="true"></i> Toutes les fiches</button
            >
            {#if lessonSalon && openSnap}
              {@const sync = syncLabel(openSnap)}
              <span class="inline-flex items-center gap-1 {quiet}"
                ><i class="bx bx-group" aria-hidden="true"></i> Salon « {salonName(
                  lessonSalon,
                )} »</span
              >
              <span
                class="inline-flex items-center gap-1 text-sm {sync.warn
                  ? 'text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark'
                  : 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'}"
                ><i class="bx {sync.icon}" aria-hidden="true"></i>{sync.text}</span
              >
              {@render avatars(viewers(openSnap, openDoc ?? undefined))}
              <button
                type="button"
                class={link}
                onclick={() => {
                  drawerElement = null
                  drawerTab = 'commentaires'
                  drawerOpen = !drawerOpen
                }}
                ><i class="bx bx-message-square-detail" aria-hidden="true"
                ></i> Discussion et commentaires{@render mentionBadge(openMentions, '')}</button
              >
            {/if}
            {#if sourceLabel}
              <span class={quiet}
                >Fiche de « {sourceLabel} » : les modifications vont dans ce
                parcours.</span
              >
            {/if}
          </div>
        {/if}
        {#if shownLesson && lessonSource?.kind === 'salon'}
          {@const src = lessonSource}
          {@const targets = (snapshots[src.salon]?.parcours ?? []).filter(
            (p) => p.etapes.length || p.paliers?.length,
          )}
          <div class="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
            {#if targets.length}
              <label class="flex flex-row items-center gap-2 text-sm">
                <i
                  class="bx bx-link text-coopmaths-action dark:text-coopmathsdark-action"
                  aria-hidden="true"
                ></i>
                <select
                  class={selectClass}
                  value=""
                  onchange={(e) => {
                    const v = e.currentTarget.value
                    e.currentTarget.value = ''
                    if (v) attachLesson(v)
                  }}
                >
                  <option value="">Ajouter à un parcours du salon…</option>
                  {#each targets as p (p.id)}
                    <optgroup label={p.titre || 'Sans titre'}>
                      {#each lessonSlots(p) as slot (slot.value)}<option
                          value={slot.value}>{slot.label}</option
                        >{/each}
                    </optgroup>
                  {/each}
                </select>
              </label>
            {/if}
            {#if confirmLessonDelete}
              <span class="inline-flex items-center gap-3 text-sm">
                Supprimer la fiche pour toute l’équipe ?
                <button
                  type="button"
                  class={link}
                  onclick={() => {
                    connections.get(src.salon)?.removeLesson(src.id)
                    openSource(null)
                  }}>Supprimer</button
                >
                <button
                  type="button"
                  class={link}
                  onclick={() => (confirmLessonDelete = false)}>Annuler</button
                >
              </span>
            {:else}
              <button
                type="button"
                class={link}
                onclick={() => (confirmLessonDelete = true)}
                ><i class="bx bx-trash" aria-hidden="true"></i> Supprimer la fiche</button
              >
            {/if}
          </div>
        {:else if shownLesson && !lessonSalon && openSalons.length}
          <label class="flex flex-row items-center gap-2 text-sm self-start">
            <i
              class="bx bx-share-alt text-coopmaths-action dark:text-coopmathsdark-action"
              aria-hidden="true"
            ></i>
            <select
              class={selectClass}
              value=""
              onchange={(e) => {
                const id = e.currentTarget.value
                e.currentTarget.value = ''
                const l = shownLesson
                if (!id || !l) return
                lessonToSalon(id, l)
                notice = `« ${l.titre || 'Sans titre'} » est copiée dans le salon « ${salonName(id)} » : l’équipe la modifie avec vous. La version d’origine ne change plus.`
              }}
            >
              <option value="">Copier dans un salon…</option>
              {#each openSalons as salon (salon.id)}<option value={salon.id}
                  >{salon.nom}</option
                >{/each}
            </select>
          </label>
        {/if}
        {#if shownLesson}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="relative"
            bind:this={lessonBox}
            onfocusin={trackFocus}
            onfocusout={leaveFocus}
            onpointermove={trackPointer}
            onpointerleave={leavePointer}
          >
            {#if pointers.length}
              <SalonPointers presences={pointers} container={lessonBox} />
            {/if}
            {#key `${lessonSalon}/${lessonDoc}`}
              <LessonEditor
                bind:this={lessonEditor}
                lesson={shownLesson}
                onchange={lessonChanged}
                collab={lessonSalon ? collab : undefined}
              />
            {/key}
          </div>
        {:else}
          {#each openSalons as salon (salon.id)}
            {@const snap = snapshots[salon.id]}
            {@const groups = lessonsOf(snap.parcours)}
            <section
              class="flex flex-col gap-3"
              aria-label="Fiches du salon {salon.nom}"
            >
              <div
                class="flex flex-row flex-wrap items-center justify-between gap-3"
              >
                <h3
                  class="flex flex-row flex-wrap items-center gap-3 text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
                >
                  <i class="bx bx-group" aria-hidden="true"></i>
                  {salon.nom}
                  {@render syncBadge(snap)}
                </h3>
                <div class="flex flex-row flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class={primary}
                    onclick={() => lessonToSalon(salon.id, emptyLesson())}
                    ><i class="bx bx-plus" aria-hidden="true"></i> Nouvelle fiche
                    dans le salon</button
                  >
                  <label class={secondary}>
                    <i class="bx bx-import" aria-hidden="true"></i> Importer une
                    fiche
                    <input
                      type="file"
                      accept=".json,application/json"
                      class="hidden"
                      onchange={(e) => {
                        importLessonToSalon(salon.id, e.currentTarget.files?.[0])
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>
              {#if !snap.fiches.length && !groups.length}
                <p class={quiet}>
                  Aucune fiche. Créez-en une, importez un fichier de fiche, ou
                  copiez dans le salon une fiche ouverte ici.
                </p>
              {/if}
              {#if snap.fiches.length}
                <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {#each snap.fiches as f (f.id)}
                    <li>
                      <button
                        type="button"
                        class={card}
                        onclick={() =>
                          openSource({ kind: 'salon', salon: salon.id, id: f.id })}
                      >
                        <i
                          class="bx bx-book-open text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct"
                          aria-hidden="true"
                        ></i>
                        <span class="min-w-0 flex-1">
                          <span
                            class="block font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                            >{f.fiche.titre || 'Sans titre'}</span
                          >
                          <span class="block {quiet}"
                            >{f.fiche.blocs.length} bloc{f.fiche.blocs.length > 1
                              ? 's'
                              : ''}</span
                          >
                        </span>
                        {@render avatars(viewers(snap, lessonDocId(f.id)))}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
              {#each groups as group (group.parcours.id)}
                {@render lessonGroup(group, (level) =>
                  openSource({
                    kind: 'salon-parcours',
                    salon: salon.id,
                    id: group.parcours.id,
                    level,
                  }),
                )}
              {/each}
            </section>
          {/each}
          {#if parcoursLessons.length}
            {#if openSalons.length}
              {@render browserToggle(
                'fiches des parcours de ce navigateur, non partagées',
              )}
            {/if}
            {#if !openSalons.length || showBrowser}
              <div class="flex flex-col gap-4" aria-label="Fiches des parcours">
                {#each parcoursLessons as group (group.parcours.id)}
                  {@render lessonGroup(group, (level) =>
                    editParcoursLesson(group.parcours.id, level),
                  )}
                {/each}
              </div>
            {/if}
          {/if}
          <p class={quiet}>
            Une fiche de cours se lit dans l’application avant l’entraînement :
            texte, formules, exemples pas à pas, questions non notées,
            graphiques à curseurs. Les fiches des parcours ouverts sont listées
            ici : modifiez-les, puis publiez le parcours. Une fiche seule n’est
            pas gardée par le site : ouvrez un fichier de fiche (ou déposez-le
            ici), modifiez-le, puis téléchargez-le. Pour la donner aux élèves,
            ajoutez-la à un palier d’un parcours.{openSalons.length
              ? ' Dans un salon, les fiches seules sont gardées et modifiées par toute l’équipe.'
              : ''}
          </p>
        {/if}
      </section>
    {:else}
      {@const salonList = objectivesSalon
        ? (snapshots[objectivesSalon] ?? null)
        : null}
      {#if openSalons.length}
        <div class="flex flex-row flex-wrap items-center gap-3">
          <span class={quiet}>Liste :</span>
          <div
            class="flex flex-row flex-wrap gap-1 rounded-lg p-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
            role="tablist"
            aria-label="Liste des objectifs"
          >
            {#each [...openSalons, { id: null, nom: 'Ce navigateur' }] as l (l.id ?? '')}
              <button
                type="button"
                role="tab"
                aria-selected={objectivesSalon === l.id}
                class={tab(objectivesSalon === l.id)}
                onclick={() => {
                  objectivesSalon = l.id
                  objectivesChosen = true
                }}
                >{l.id ? `Salon « ${l.nom} »` : l.nom}</button
              >
            {/each}
          </div>
          {#if salonList}{@render syncBadge(salonList)}{/if}
        </div>
      {/if}
      {#if objectivesSalon && salonList}
        {@const salon = objectivesSalon}
        {#key salon}
          <ParcoursObjectives
            objectives={salonList.objectives}
            parcours={salonList.parcours}
            {levels}
            own={library.objectives}
            onchange={(objectives) =>
              connections
                .get(salon)
                ?.writeObjectives(mergeObjectives([], objectives))}
          />
        {/key}
      {:else}
        <ParcoursObjectives
          objectives={library.objectives}
          parcours={library.entries.map((e) => e.parcours)}
          {levels}
          onchange={(objectives) =>
            (library = {
              ...library,
              objectives: mergeObjectives([], objectives),
            })}
        />
      {/if}
    {/if}
  </main>

  {#if drawerOpen && openSnap && openSalon && openDoc}
    {@const salon = openSalon}
    {@const doc = openDoc}
    {@const p = view === 'parcours' ? current : null}
    {@const l = view === 'fiches' ? shownLesson : null}
    {#snippet versionsTab()}
      {#if p}
        <VersionsPanel
          {salon}
          current={p}
          onrestore={(v) => connections.get(salon)?.write(v)}
        />
      {/if}
    {/snippet}
    <div
      class="fixed z-30 inset-x-2 bottom-2 h-[60vh] lg:inset-x-auto lg:right-4 lg:top-24 lg:bottom-4 lg:h-auto lg:w-96 shadow-xl rounded-xl"
    >
      <SalonDrawer
        snapshot={openSnap}
        docId={doc}
        members={members[salon] ?? []}
        discussionMentions={discussionMentions(salon)}
        describe={(el) =>
          p ? elementName(p, el) : l ? lessonElementName(l, el) : el}
        whole={p ? 'Tout le parcours' : 'Toute la fiche'}
        bind:tab={drawerTab}
        bind:element={drawerElement}
        onmessage={(t) => connections.get(salon)?.message(t)}
        oncomment={(el, t, parent) =>
          connections.get(salon)?.comment(doc, el, t, parent)}
        onshow={(el) => {
          // En aperçu élève, l'éditeur est caché : on le montre à côté de l'aperçu
          if (p && display === 'preview')
            display = window.matchMedia('(min-width: 1024px)').matches
              ? 'split'
              : 'edit'
          ;(p ? parcoursEditor : lessonEditor)?.reveal(el)
        }}
        onresolve={(id, r) => connections.get(salon)?.resolve(id, r)}
        onclose={() => (drawerOpen = false)}
        versions={p ? versionsTab : undefined}
      />
    </div>
  {/if}
</div>
