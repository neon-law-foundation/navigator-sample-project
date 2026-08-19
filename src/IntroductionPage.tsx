// Copyright (C) 2026 Neon Law Foundation.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  BookOpen,
  CalendarClock,
  CircleDot,
  ExternalLink,
  FileText,
  Network,
  Scale,
} from 'lucide-react'
import { useState } from 'react'

import { Doughnut, HedgeScene, type BiteState } from './art'
import { DOCUMENTS, type MatterDocument } from './documents'
import { MATTER } from './matter'
import { portalPath } from './mount'
import { PdfViewer } from './PdfViewer'
import { READY_KICKER } from './ready'
import { RelationshipGraph } from './RelationshipGraph'
import { AUTHORITIES, RESEARCH_NOTE, type Authority, type Leaning } from './research'
import {
  BOTTOM_LINE,
  CHRONOLOGY,
  GAP_DAYS,
  GRAPH_NODES,
  ISSUES,
  SOUL_CLAIM,
  SOUL_FACTS,
} from './soulContract'

/*
 * navigator-ux, used for the documents tab only.
 *
 * `Badge` and `Button` are aliased because the shadcn components below own
 * those names in this file. Everything else lands unaliased.
 */
import {
  Badge as NavBadge,
  Button as NavButton,
  Callout,
  DownloadCard,
  DownloadGrid,
  LinkButton,
  Panel,
} from '@neon-law-foundation/navigator-ux'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/**
 * Count II: the introduction to the case.
 *
 * Six tabs, in the order a reader needs them — what happened, who is involved,
 * when, what it turns on, what the law says, and what has been filed.
 */
export function IntroductionPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {READY_KICKER}
        </p>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            {SOUL_CLAIM.title}
          </h1>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {SOUL_CLAIM.count} · {MATTER.caption} · {SOUL_CLAIM.jurisdiction}
          </p>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Ned Flanders offered Homer Simpson a doughnut and called it neat. A term conveying
          Homer&apos;s soul was, it is alleged, inside the doughnut rather than in anything said.
          Homer ate part of it, waited {GAP_DAYS} days, and ate the rest because he was hungry. The
          question is whether the year in between costs him the right to undo it.
        </p>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          {SOUL_FACTS.map((fact) => (
            <div key={String(fact.label)} className="bg-card px-4 py-3">
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-0.5 font-serif text-base font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>The offer, as pleaded</CardTitle>
            <CardDescription>Illustration — original artwork, not evidence.</CardDescription>
          </div>
          <Badge variant="warning">Disputed</Badge>
        </CardHeader>
        <HedgeScene />
      </Card>

      <Tabs defaultValue="story">
        <TabsList>
          <TabsTrigger value="story">
            <BookOpen /> The introduction
          </TabsTrigger>
          <TabsTrigger value="web">
            <Network /> The web
          </TabsTrigger>
          <TabsTrigger value="when">
            <CalendarClock /> Chronology
          </TabsTrigger>
          <TabsTrigger value="issue">
            <Scale /> The question
          </TabsTrigger>
          <TabsTrigger value="research">
            <BookOpen /> Research
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText /> Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <StoryTab />
        </TabsContent>
        <TabsContent value="web">
          <WebTab />
        </TabsContent>
        <TabsContent value="when">
          <ChronologyTab />
        </TabsContent>
        <TabsContent value="issue">
          <QuestionTab />
        </TabsContent>
        <TabsContent value="research">
          <ResearchTab />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Two columns on desktop, stacked on mobile — the shape every tab below uses. */
function Split({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">{children}</div>
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-[0.95rem] leading-relaxed">{children}</div>
}

/* ----------------------------------------------------------------- story */

/**
 * Keyed by state rather than an array searched at render.
 *
 * A `Record<BiteState, …>` cannot miss: the compiler requires an entry for
 * every state, and the lookup is total, so there is no "not found" branch to
 * write a fallback for.
 */
const BITES: Record<BiteState, { label: string; when: string; consequence: string }> = {
  whole: {
    label: 'Before',
    when: '1 April 2025, at the hedge',
    consequence:
      'An offer, and nothing more. Flanders holds the doughnut out and describes it as "neat." Whatever is written inside it has been said to nobody.',
  },
  bitten: {
    label: 'One bite',
    when: '1 April 2025, moments later',
    consequence:
      'Performance has begun. Under Restatement § 45 that binds the offeror to keep the offer open — it does not close the bargain. The remainder goes in the refrigerator.',
  },
  gone: {
    label: 'Finished',
    when: `14 April 2026, ${GAP_DAYS} days later`,
    consequence:
      'Performance is complete, and on the orthodox rule this is where acceptance lands. Homer still does not know about the term. He finds out the following day.',
  },
}

const BITE_ORDER: BiteState[] = ['whole', 'bitten', 'gone']

function StoryTab() {
  const [bite, setBite] = useState<BiteState>('whole')
  const current = BITES[bite]

  return (
    <Split>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What happened</CardTitle>
          </CardHeader>
          <CardContent>
            <Prose>
              <p>
                On 1 April 2025 Ned Flanders leaned over the hedge between the two properties and
                offered Homer Simpson a doughnut. Homer alleges Flanders appeared in a horned aspect
                and said only that the doughnut was <em>neat</em>. Flanders denies the aspect,
                denies concealing anything, and says he was being neighborly.
              </p>
              <p>
                The doughnut is alleged to have carried a term conveying Homer&apos;s soul — not
                spoken, not handed over on paper, but baked into the instrument itself, where an
                offeree cannot read it without destroying the thing he is being asked to accept.
              </p>
              <p>
                Homer took one bite and put the rest in the refrigerator. It stayed there for{' '}
                {GAP_DAYS} days. On 14 April 2026, hungry and thinking about nothing in particular,
                he ate the remainder. He learned of the soul term the next day and served notice of
                rescission seventeen days after that.
              </p>
            </Prose>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>The instrument</CardTitle>
              <CardDescription>Scrub through the three states of the doughnut.</CardDescription>
            </div>
            <ToggleGroup
              type="single"
              value={bite}
              onValueChange={(next) => next && setBite(next as BiteState)}
              aria-label="Bite state"
            >
              {BITE_ORDER.map((state) => (
                <ToggleGroupItem key={state} value={state}>
                  {BITES[state].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <Doughnut state={bite} size={176} />
            <div className="min-w-56 flex-1 space-y-2">
              <p className="font-serif text-base font-semibold">{current.when}</p>
              <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                {current.consequence}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Why this is not simple</CardTitle>
          </CardHeader>
          <CardContent>
            <Prose>
              <p>
                A doughnut is an odd instrument, but the problem it creates is an ordinary one. The
                bargain was performed in two pieces separated by a year, and the two candidate
                moments of acceptance land on opposite sides of everything that matters: which terms
                bound Homer, when the clock started, and whether the second bite was a choice or an
                appetite.
              </p>
            </Prose>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Consideration', body: 'One (1) glazed doughnut, now consumed.' },
            {
              title: 'Counter-promise',
              body: "Conveyance of the plaintiff's soul, term undisclosed.",
            },
            { title: 'Gap', body: `${GAP_DAYS} days between the first bite and the last.` },
            { title: 'Notice', body: 'Served 17 days after discovery.' },
          ].map((fact) => (
            <Card key={fact.title}>
              <CardContent className="px-4 py-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {fact.title}
                </p>
                <p className="mt-1 text-sm">{fact.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert variant="warning">
          <CircleDot />
          <AlertTitle>The instrument no longer exists</AlertTitle>
          <AlertDescription>
            Both bites are proved by testimony alone, which is why the witnesses in the next tab are
            doing more work in this matter than they normally would.
          </AlertDescription>
        </Alert>
      </div>
    </Split>
  )
}

/* ------------------------------------------------------------------- web */

function WebTab() {
  const [selectedId, setSelectedId] = useState<string | null>('doughnut')
  const selected = GRAPH_NODES.find((node) => node.id === selectedId) ?? null

  return (
    /*
     * The graph gets the full width rather than a column in a split.
     * At 760×560 in a two-column layout it renders at roughly half scale, and
     * the node labels stop being readable — which defeats the point of drawing
     * names on them. The reading matter goes underneath instead.
     */
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Who is connected to what</CardTitle>
            <CardDescription>
              A force-directed graph. Drag a node, hover to isolate its ties, click to pin the
              detail.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <RelationshipGraph selectedId={selectedId} onSelect={setSelectedId} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{selected ? selected.label : 'Nothing selected'}</CardTitle>
            {selected ? (
              <Badge
                variant={
                  selected.kind === 'party'
                    ? 'default'
                    : selected.kind === 'term'
                      ? 'destructive'
                      : selected.kind === 'instrument'
                        ? 'warning'
                        : 'secondary'
                }
              >
                {selected.kind}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-primary">{selected.role}</p>
                <Separator />
                <p className="text-[0.95rem] leading-relaxed">{selected.detail}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pick a node in the graph to read who they are to the case.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to read it</CardTitle>
          </CardHeader>
          <CardContent>
            <Prose>
              <p>
                The two households pull to opposite sides and the doughnut settles between them,
                because that is the shape of the dispute: everything contested happened in the gap
                between two yards.
              </p>
              <p>
                The doughnut and the hidden term are drawn as nodes rather than as labels on an
                edge. They are not relationships between people — they are the things the people are
                arguing about, and a graph that draws only humans hides the question.
              </p>
            </Prose>
          </CardContent>
        </Card>

        <Alert variant="info" className="self-start">
          <CircleDot />
          <AlertTitle>The notebook</AlertTitle>
          <AlertDescription>
            Lisa Simpson&apos;s dated notebook is the most valuable document in the matter. It is
            the only contemporaneous record bearing on when Homer actually learned of the term — and
            the whole count turns on that date.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ chronology */

const FEED_ACCENT: Record<string, string> = {
  danger: 'bg-chart-2',
  brand: 'bg-chart-1',
  warning: 'bg-chart-3',
  link: 'bg-chart-5',
  success: 'bg-chart-4',
  neutral: 'bg-muted-foreground',
}

function ChronologyTab() {
  return (
    <Split>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Chronology</CardTitle>
            <CardDescription>Seven events, two of them a year apart.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-6 border-l pl-8">
            {CHRONOLOGY.map((post) => (
              <li key={post.id} className="relative">
                {/* The rail dot, pulled back over the border of the <ol>. */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-[2.32rem] top-1 flex size-7 items-center justify-center rounded-full text-[0.6rem] font-bold text-background ring-4 ring-card ${
                    FEED_ACCENT[post.accent ?? 'neutral'] ?? 'bg-muted-foreground'
                  }`}
                >
                  {post.initials}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <time dateTime={post.date} className="font-mono text-xs text-muted-foreground">
                    {post.dateLabel}
                  </time>
                  {post.kind ? (
                    <Badge variant={post.id === 'second-bite' ? 'destructive' : 'secondary'}>
                      {post.kind}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-1 font-serif text-base font-semibold">{post.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {post.actor}
                  {post.role ? ` · ${post.role}` : ''}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>The gap</CardTitle>
          </CardHeader>
          <CardContent>
            <Prose>
              <p>
                Everything Flanders has is built on the {GAP_DAYS} days in the middle. The argument
                is intuitive: a man who genuinely thought he had been tricked would not have finished
                the pastry.
              </p>
              <p>
                The answer is that the premise is backwards. Homer did not finish it{' '}
                <em>despite</em> knowing — he finished it <em>because</em> he did not know, and the
                law of ratification cares about exactly that difference.
              </p>
            </Prose>
          </CardContent>
        </Card>

        <Alert variant="destructive">
          <CircleDot />
          <AlertTitle>15 April 2026 is the load-bearing date</AlertTitle>
          <AlertDescription>
            Discovery starts the limitations clock, and knowledge is what turns eating into
            affirming. Move that date earlier than 14 April and the count fails; leave it where it
            is and the year in the middle is legally uneventful.
          </AlertDescription>
        </Alert>
      </div>
    </Split>
  )
}

/* -------------------------------------------------------------- question */

const ISSUE_ACCENT = {
  ready: 'border-l-4 border-l-chart-4',
  wait: 'border-l-4 border-l-chart-3',
  risk: 'border-l-4 border-l-chart-2',
  default: 'border-l-4 border-l-border',
} as const

function QuestionTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Can Homer rescind?</CardTitle>
            <CardDescription>
              Five questions, in the order they have to be decided.
            </CardDescription>
          </div>
          <Badge variant="success">Analysis</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">
            <strong className="font-serif">{BOTTOM_LINE.answer}</strong>{' '}
            <span className="text-muted-foreground">{BOTTOM_LINE.because}</span>
          </p>
          <Alert variant="destructive">
            <CircleDot />
            <AlertTitle>Where it can go wrong</AlertTitle>
            <AlertDescription>{BOTTOM_LINE.risk}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ISSUES.map((issue) => (
          <Card key={issue.id} className={ISSUE_ACCENT[issue.tone]}>
            <CardContent className="space-y-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {issue.kicker}
              </p>
              <h3 className="font-serif text-base font-semibold leading-snug">{issue.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{issue.reading}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The two positions, side by side</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[54rem]">
            <TableCaption>
              Each row is one step in the analysis. The last column is where we think it lands.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[16%]">Question</TableHead>
                <TableHead className="w-[34%]">The rule</TableHead>
                <TableHead className="w-[25%]">Simpson</TableHead>
                <TableHead className="w-[25%]">Flanders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ISSUES.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-serif font-semibold">{issue.title}</TableCell>
                  <TableCell className="text-muted-foreground">{issue.question}</TableCell>
                  <TableCell>{issue.homer}</TableCell>
                  <TableCell>{issue.ned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------- research */

const LEANING_LABEL: Record<Leaning, string> = {
  homer: 'Helps Simpson',
  flanders: 'Helps Flanders',
  neutral: 'Cuts both ways',
}

const LEANING_VARIANT = {
  homer: 'success',
  flanders: 'destructive',
  neutral: 'warning',
} as const

const ISSUE_LABEL: Record<Authority['issue'], string> = {
  formation: 'Formation — when acceptance lands',
  ratification: 'Ratification — did the second bite affirm?',
  limitations: 'Limitations — has the clock run?',
}

function ResearchTab() {
  const [issue, setIssue] = useState<Authority['issue'] | 'all'>('all')
  const shown = AUTHORITIES.filter((a) => issue === 'all' || a.issue === issue)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Authorities</CardTitle>
            <CardDescription>{RESEARCH_NOTE}</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={issue}
            onValueChange={(next) =>
              setIssue((next || 'all') as Authority['issue'] | 'all')
            }
            aria-label="Filter authorities by issue"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="formation">Formation</ToggleGroupItem>
            <ToggleGroupItem value="ratification">Ratification</ToggleGroupItem>
            <ToggleGroupItem value="limitations">Limitations</ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            <BookOpen />
            <AlertTitle>These citations are real</AlertTitle>
            <AlertDescription>
              Everything else in this portal is invented. The {AUTHORITIES.length} authorities below
              are not: each was retrieved from Midpage and checked against the opinion or statute
              text before it was written down, and each quote is verbatim.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {shown.map((authority) => (
          <Card key={authority.id}>
            <CardHeader>
              <div className="min-w-0">
                <CardTitle className="text-base">{authority.cite}</CardTitle>
                <CardDescription>
                  {ISSUE_LABEL[authority.issue]} · citator: {authority.treatment}
                </CardDescription>
              </div>
              <Badge variant={LEANING_VARIANT[authority.leaning]}>
                {LEANING_LABEL[authority.leaning]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-[0.95rem] leading-relaxed">
              <p>
                <span className="font-semibold">Holding.</span> {authority.proposition}
              </p>
              <blockquote className="border-l-2 border-primary/40 bg-muted/50 py-2 pl-4 italic text-muted-foreground">
                &ldquo;{authority.quote}&rdquo;
              </blockquote>
              <p>
                <span className="font-semibold">Scope.</span> {authority.scope}
              </p>
              <p>
                <span className="font-semibold">Here.</span> {authority.application}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <a href={authority.url} target="_blank" rel="noreferrer noopener">
                  Read it on Midpage <ExternalLink />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- documents */

/**
 * The documents tab.
 *
 * Every PDF here is produced by `navigator template render` from a notation
 * template in `templates/neon_law/`, which is why each card names the template
 * and its code: the provenance is the point. `pnpm render:documents`
 * regenerates both.
 *
 * This is the one area built on navigator-ux rather than the shadcn components
 * the rest of the portal uses — `Panel`, `DownloadCard`, and `Callout` come
 * from the library. The viewer inside them does not: see `PdfViewer` for why
 * this repository owns that one.
 */
function DocumentsTab() {
  const [activeId, setActiveId] = useState<string>(DOCUMENTS[0]?.id ?? '')
  const active: MatterDocument | undefined =
    DOCUMENTS.find((doc) => doc.id === activeId) ?? DOCUMENTS[0]

  return (
    <div className="space-y-6">
      <Panel
        title="Documents"
        note="Rendered from the notation templates in this repository, not hand-authored."
        actions={<NavBadge tone="source">{DOCUMENTS.length} documents</NavBadge>}
      >
        <DownloadGrid>
          {DOCUMENTS.map((doc) => (
            <DownloadCard
              key={doc.id}
              title={doc.title}
              badge={
                <NavBadge tone={doc.status === 'served' ? 'ready' : 'review'}>{doc.status}</NavBadge>
              }
              description={
                <>
                  {doc.kind} · {doc.dateLabel} · {doc.pages} pages
                  <br />
                  Rendered from <code className="font-mono text-xs">{doc.code}</code>
                </>
              }
              actions={
                <>
                  <NavButton
                    variant={doc.id === active?.id ? 'primary' : 'default'}
                    onClick={() => setActiveId(doc.id)}
                    aria-pressed={doc.id === active?.id}
                  >
                    {doc.id === active?.id ? 'Viewing' : 'View'}
                  </NavButton>
                  <LinkButton href={portalPath(doc.path)} target="_blank" rel="noreferrer noopener">
                    Open PDF
                  </LinkButton>
                </>
              }
            />
          ))}
        </DownloadGrid>
      </Panel>

      {active ? (
        <Split>
          {/*
            `key` on the panel, not just the viewer: switching documents should
            start a new viewer rather than hand a live one a different `src`,
            so the page number and zoom of the file being left behind do not
            carry over onto the file being opened.
          */}
          <Panel
            key={active.id}
            title={active.title}
            note={`${active.kind} · ${active.dateLabel}`}
            actions={
              <LinkButton href={portalPath(active.path)} target="_blank" rel="noreferrer noopener">
                Open full size
              </LinkButton>
            }
            className="overflow-hidden p-0"
          >
            <PdfViewer
              src={portalPath(active.path)}
              label={active.title}
              className="h-[40rem] rounded-md border"
            />
          </Panel>

          <div className="space-y-6">
            <Panel title="Why it matters">
              <p className="text-[0.95rem] leading-relaxed">{active.why}</p>
            </Panel>

            <Panel title="How this document is made">
              <Prose>
                <p>
                  It is not a file somebody typed.{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {active.template}
                  </code>{' '}
                  is a notation template — Markdown with a questionnaire and a workflow in its
                  frontmatter — and the PDF is what <code>navigator template render</code> produces
                  from it once the answers are supplied.
                </p>
                <p>
                  The renderer validates against the same notation rule set as{' '}
                  <code>navigator validate</code> and refuses any template with a violation, so a
                  document that renders is a document that passed. Markdown becomes Typst and
                  compiles in pure Rust — no shell-out, no headless browser.
                </p>
                <Callout tone="info">
                  Regenerate both with <code>pnpm render:documents</code>. The dates and the client
                  name are <code>--answer</code> flags, which is the same substitution a real matter
                  performs from questionnaire responses.
                </Callout>
              </Prose>
            </Panel>
          </div>
        </Split>
      ) : null}
    </div>
  )
}
