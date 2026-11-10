# MathALÉA Spec

## Objective

- Build an exercise generator supporting HTML (with multiple interactivity modes), Typst and LaTeX output formats.

## Tech Stack

- Svelte 5+, Vite 7+, Vitest 4+, Tailwind CSS 4+

## Commands

- Unit Tests: `pnpm prebuild-unit-tests` (runs vitest, must pass before commit)
- TypeCheck (default): `pnpm check:changed` (files changed since HEAD plus
  everything that imports them, a few seconds). Run it after editing `.ts` or
  `.svelte` files; no need to rerun it before committing. It switches by itself to the
  full check when more than 500 files are concerned (e.g. a helper in
  `src/lib`) or when a `.d.ts` changed.
- Full TypeCheck: `pnpm check` (~90 s). Only when `check:changed` is blind:
  `tsconfig*.json`, `package.json`/lockfile or Svelte/Vite config changed, a
  `.json` file imported by TypeScript changed, or the branch was just
  merged/rebased with `main`. Not after a change limited to an exercise.
- Exercise draw stability: `pnpm stability:check` (see `documentation/tests/stabilite-exercices.md`)
- Exercise accessibility, informative only: `pnpm a11y:check` (see `documentation/tests/controle-accessibilite.md`)

## Testing

- The project uses Vitest for tests and Playwright for browser tests. Do not
  install other testing or browser automation libraries (for example,
  Puppeteer).
- A dev server only shows the checkout it was started from, and several
  worktrees often run side by side: never assume `localhost:5173` serves yours.
  Reuse a server only if its working directory is your checkout
  (`lsof -a -p <pid> -d cwd`, pid from `lsof -nP -iTCP:<port> -sTCP:LISTEN`).
  Otherwise start `pnpm dev` from your checkout (it also updates the
  dictionaries), with your harness's background-task tool rather than `&` or
  `nohup`, so the server stops with the session. Never pass `--host`: an IPv4
  server can share a port with an IPv6 one, and `localhost:<port>` then shows
  either checkout. Give the user links with the port Vite actually printed.
- To check the settings panel or any interaction, use real mouse clicks, not a
  programmatic `element.click()`: the order of events differs, and a bug can show
  up only with real clicks.
- After `pnpm makeJson`, `pnpm stability:check` or `pnpm stability:update`, the dev
  server may show a blank page because it cached an empty JSON file. Run
  `touch src/json/*.json`, then reload the page.

## Writing an exercise

Titles and instructions are in the infinitive; every sentence ends with a
period (except before a math formula on its own line); the final answer is
wrapped in `miseEnEvidence()` and, for an interactive exercise, matches
exactly what the student must type (no units if the input field doesn't
expect them). When an exercise has both a multiple-choice and a free-input
version, the highlight differs: the QCM answer may be `x = value`, whereas the
free input only expects `value`, so only `value` is highlighted there.
A percentage always carries a non-breaking space before the `%` sign, never
`33%` or `33 %`: `33${sp()}%` in text (also for a variable, `${taux}${sp()}%`),
`$33\\,\\%$` in math mode; code only, not comments, CSS values or URLs. See `documentation/developpement/auteurs-exercices/rediger-un-exercice.md`
for the full rules and examples.

A question holds a single `ajouteChampTexteMathLive()` at index `i`; for
several answers, use one `remplisLesBlancs()` field or `subQuestions` (see
`interactivite-simple.md`). For a question-type setting, prefer
`besoinFormulaireTexte` (dash-separated cases, model `src/exercices/1e/1AL10-2.ts`)
over a numeric menu (see `complements/formulaires-parametres.md`).

## Accessibility of new exercises

Every `mathalea2d` figure of a new exercise has a `description` (plain text with
the drawn values, not the answer: `stringNombre()`, no `$`, no LaTeX) or
`decorative: true` if it carries no information. If a description would give the
answer, it only presents the task and the constructor sets
`this.demandeLaVue = true` with the reason (model `src/exercices/6e/6G0-7.ts`).
Never refer to an element by its color alone ("le segment rouge") or its position
alone ("à gauche", "ci-dessous"). Use the engine's fields and interactive formats,
no handwritten HTML. See the "Accessibilité" section of
`documentation/developpement/auteurs-exercices/rediger-un-exercice.md`.

## No randomness in constructors

An exercise constructor never draws random values (`randint`, `choice`,
`shuffle`, `Math.random()`…, including class field initializers) and parameter
defaults (`this.sup2 = 3`) are fixed: the seed only applies from
`nouvelleVersion()` on, so a draw in the constructor makes a shared link show a
different exercise on each load. All draws belong in `nouvelleVersion()`. See
`documentation/developpement/auteurs-exercices/rediger-un-exercice.md`.

## Questions and sub-questions a), b), c)

`createQuestion(this, i, { question, correction, answer | subQuestions })`
(`src/lib/interactif/createQuestion.ts`) fills a question, its correction and
its answers. With `subQuestions`, each answer field sits in its item and each
correction under the same label. Do not write "a)" by hand nor group the
fields at the end of the question. Model:
`src/exercices/modèlesExos/40_questions_et_sous_questions.ts`; see
`documentation/developpement/auteurs-exercices/complements/sous-questions.md`.

## Interactive exercises: fixed points per question (mandatory)

A given question of an exercise must always be worth the same number of
points, whatever the seed and whatever is drawn (number of answer fields,
sub-problem, etc.). Score reporting to recorders (Capytale, Moodle…) relies on
a fixed maximum. When the number of fields of a question depends on the draw,
set a `bareme` with a fixed total in `handleAnswers()` (e.g.
`troisPointsProportionnels`, `toutPourUnPoint`) instead of the default
`toutAUnPoint`. Check this rule whenever you touch interactivity. See
`documentation/developpement/auteurs-exercices/interactivite-simple.md`.

## Adding a check or a comparison option

Comparison logic never lives in an exercise file: no `compare: (input, answer) => …`
and no local comparison helper. Combine the checks of `src/lib/interactif/checks/`
with `seq()` or `all()`; use these composable checks first, before the
`fonctionComparaison()` options. If no combination fits, add a check.

A new check (`src/lib/interactif/checks/`) is exported from `checks/index.ts`,
registered on the check-test page (`src/components/devtools/CheckTest.svelte`)
and documented in the catalogue of
`documentation/developpement/auteurs-exercices/complements/checks-composables.md`
under a heading with its exact name. A new `fonctionComparaison()` option is
documented in `options-de-comparaison.md`. Feedback messages follow the tone of
the existing ones: short, and instructions in the infinitive.

## Modifying a published exercise

Shared links carry the exercise uuid, the random seed and the chosen parameters
(`s`, `s2`, `s3`), so the values drawn for a given seed must never change — for
any parameter value, not just the defaults. Reordering or inserting calls to the
random generator breaks corrections users have already handed out. Run
`CHANGED_FILES="<file>" pnpm stability:check` after editing an exercise; if the
drift is intended, archive the published version with
`pnpm archive <code>` (e.g. `pnpm archive 6N1E`), or pass the full file path.
If the drift is only noticed after the change is committed (often via a shared
helper or parent exercise), use `pnpm archive:retro <code>` instead — it
recovers the last un-drifted version from git history. See
`documentation/tests/stabilite-exercices.md`
A published `uuid` must never vanish: every old `uuid` maps to the current one
in `src/json/uuidsRemplaces.json` (filled by `pnpm archive`; `pnpm uuids:check`
fails otherwise), which lets `pnpm archive:purge` delete old `-old.ts` files
after a year.

## Turning a QCM into a free-input exercise

An already-published QCM that becomes "free input by default" changes what users
see, so archive it first (`pnpm archive <code>`, before editing anything). Then
extend `ExerciceQcmACourt`, remove `amcType`, run `pnpm makeJson` and
`pnpm stability:update`. The default comparison is fine: set `compareReponseCourte`
only when the form of the answer matters. See
`documentation/developpement/auteurs-exercices/interactivite-simple.md`
(section "Conserver un QCM en option") and
`documentation/developpement/auteurs-exercices/mathematiques/probabilites.md`
for the wording of the instructions.

## Commits

Semantic commits with the exercise reference(s) as scope, message in french:
`fix(6M2B): ...`, `feat(3A11, 3A10-3): ...`. See
`documentation/developpement/auteurs-exercices/partager-son-travail.md`.

Never commit or push without the user's explicit approval, asked each time
after showing the diff. Do not add a `Co-Authored-By` trailer or any other
agent attribution to commit messages or merge requests.

## Skills

Step-by-step procedures live in `.claude/skills/<name>/SKILL.md`; agents
without skill support should read the matching file before starting:
`nouvel-exercice`, `modifier-exercice-publie`, `qcm-vers-saisie-libre`,
`typst-check`, `classer-ref-ch`.

## Project Structure

- `src/components` – app .svelte components
- `src/exercices` - exercise .ts files (almost all non-static exercises)
- `src/lib` - .ts helpers (mostly functions)
- `src/modules` - .ts helpers (mostly classes)
- `tests/` – unit and e2e tests
- `tasks/` – utility scripts

## State Management

- `exercicesParams` store - Current exercise list and parameters
- `globalOptions` store - Display settings (corrections, interactivity, etc.)
- URL-based state - Parameters synced to URL for sharing

## Language

Codebase in english. Comments, documentation and user-displayed content in french.
Answer the user in french.

## Answering Codebase Questions

When answering a developer question about this codebase:

- Start with `documentation/README.md`, then follow the relevant documentation links.
- If documentation appears to answer the question, run a quick consistency check against the codebase before answering: verify referenced files, key symbols, scripts in `package.json`, or mentioned tests with `rg` or targeted file reads.
- Cite the documentation page(s) used in the answer and state that the relevant code references were checked.
- If documentation is missing, incomplete, or inconsistent with the code, inspect the codebase with `rg` and targeted reads before answering.
- When the answer reveals durable missing or obsolete knowledge, update or create the relevant page under `documentation/` in the same change.
- Do not document disposable investigation details, temporary state, unconfirmed bugs, or personal preferences.
