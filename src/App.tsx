import {
  ActionList,
  Callout,
  CaseHead,
  CaseNav,
  ExternalLink,
  Layout,
  LegalDisclaimer,
  NavigatorFooter,
  Panel,
  Shell,
  Stack,
  StatusStrip,
} from '@neon-law-foundation/navigator-ux'

import { MATTER, MATTER_FACTS, NEXT_STEPS } from './matter'
import { portalPath } from './mount'

/**
 * The portal, composed entirely from `navigator-ux`.
 *
 * There is no stylesheet in this repository. Every surface below is a library
 * component reading the `--nav-*` token contract, which is what keeps this
 * bundle looking like the Navigator page that linked to it — and what means a
 * brand change is a token file somewhere else rather than an edit here. If a
 * layout need arises that the library cannot express, the fix belongs in the
 * library, not in a local override that only this app benefits from.
 *
 * The matter surfaces (`CaseNav`, `Shell`, `CaseHead`, `Layout`, `Panel`) are
 * the right family here rather than the public marketing shell: this is an
 * authenticated matter workspace, not a landing page.
 */
export function App() {
  return (
    // `nav-theme` carries the library's ground, ink, and link colors for the
    // whole document. `Shell` renders the <main> inside it.
    <div className="nav-theme">
      <CaseNav
        brand="NAVIGATOR · CLIENT PORTAL"
        caption={`${MATTER.caption} — ${MATTER.claim.toLowerCase()}`}
        links={[
          // Derived from the mount: this is a path inside the bundle.
          { label: 'Overview', href: portalPath(''), current: true },
          // Absolute on purpose: Navigator's own matter list, not a path in
          // this bundle. It is stable across every deployment because it is
          // Navigator's route, not ours.
          { label: 'Your matters', href: '/app/projects' },
        ]}
      />

      <Shell>
        <CaseHead
          // The mount contract. This element is rendered by React, so it
          // exists only once the app has mounted — which is exactly what
          // Navigator's browser walkthrough is asking about when it waits for
          // `#simpsons-portal-ready`. A static marker in `index.html` would
          // report "ready" for a bundle that failed to boot.
          kicker={<span id="simpsons-portal-ready">Client portal · live</span>}
          title={MATTER.caption}
          docket={`${MATTER.claim} · ${MATTER.jurisdiction} · Fixture matter`}
          summary="Your matter workspace: where things stand, what happens next, and how to reach the people working on it."
        >
          <StatusStrip cells={MATTER_FACTS} />
        </CaseHead>

        <Layout>
          <Stack>
            <Panel title="Where things stand">
              <p>
                This is the client portal application served for your matter, streamed from
                Navigator&apos;s per-deployment applications bucket. It arrives from Navigator&apos;s
                own origin, behind your session and the participation list for {MATTER.caption}, so
                only the people on the matter can reach it.
              </p>
              <p>
                Nothing on this page is a live record. {MATTER.caption} is a fixture matter, and this
                bundle is the worked example a contributor reads before attaching a real application
                to a real one.
              </p>
            </Panel>

            <Panel title="Next steps" note="In the order they are useful.">
              <ActionList items={NEXT_STEPS} />
            </Panel>
          </Stack>

          <Stack>
            <Panel title="About this portal">
              <p>
                Navigator mounts this bundle at <code>{portalPath('')}</code> and streams it rather
                than redirecting to a signed URL — a signed URL is shareable by whoever holds it and
                would not carry your session.
              </p>
              <p>
                It is a Vite + React build on{' '}
                <ExternalLink href="https://github.com/neon-law-foundation/navigator-ux">
                  navigator-ux
                </ExternalLink>
                , the component library behind{' '}
                <ExternalLink href="https://github.com/neon-law-foundation/navigator">
                  Navigator
                </ExternalLink>
                .
              </p>
            </Panel>

            <Callout tone="info">
              There is no backend in this repository. A portal that needs data reads it same-origin
              from Navigator&apos;s <code>/app/api</code> and writes through its command boundary, so
              the session cookie and the participation gate apply without any code here doing
              anything to earn them.
            </Callout>

            <LegalDisclaimer>
              This portal shows simulated information only. {MATTER.caption} is a fixture matter used
              to demonstrate Navigator, no part of it describes a real dispute, and nothing here is
              legal advice.
            </LegalDisclaimer>
          </Stack>
        </Layout>
      </Shell>

      <NavigatorFooter legal={`Fixture data only — ${MATTER.caption} is a simulated matter.`} />
    </div>
  )
}
