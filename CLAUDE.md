# Working in this repository

## Stay inside this repository

Everything needed to build, run, test, and understand this bundle is in this
repository. Read and edit only what is inside it. Do not go looking through the
rest of the machine — not the home directory, not sibling checkouts, not other
Navigator repositories, not the system temp directory.

That includes the places it is tempting to reach for:

* **Another checkout of Navigator itself.** The route this bundle mounts under
  belongs to Navigator, and `README.md` records what the contract is. Read the
  README rather than a copy of `portal/src/project_portal.rs` that happens to be
  on this machine — it may be a different revision than the one serving this
  bundle, and a contract read from the wrong revision is worse than one read
  from documentation.
* **A sibling sample project.** The other sample bundles solve the same problem
  differently on purpose. Copying from one of them by hand imports a decision
  without importing the reason for it.
* **Anything under `~/`.** No credential, no `.npmrc`, no global config is
  needed here: `pnpm install` runs with no registry account and no token, which
  is the point of installing navigator-ux from a public GitHub Release.

`node_modules/` **is** inside the repository and is fair game — it is where the
published navigator-ux tokens, types, and stylesheet actually live, and reading
them is how you check what the library provides rather than guessing at it.

If a task genuinely cannot be done without something outside this tree, say so
and ask. Do not go find it.

Scratch files belong outside the repository, in the session's scratchpad. A
temporary script left in the working tree becomes somebody's confusing diff.

## Everything here is fixture data

*Cruller v. Prine* is a simulated matter. No client data belongs in this
repository, ever — not in a template, not in a test, not as an example in a
comment. This is a worked example a contributor reads and clones, so anything
committed here is something somebody will copy.

## Before calling work done

`pnpm check` — lint, typecheck, build, and tests, in that order. The build is
part of it because several tests assert against what `pnpm build` actually
emitted rather than against the source.

`README.md` is the orientation: what mounts where, why the base path is
load-bearing, what the ready-hook contract is, and how the documents are
rendered. It is long because those are the things that break a bundle silently.
Read it before changing anything structural, and update it when the answer it
gives stops being true.

## Getting a change merged

Changes reach `main` through a pull request — the branch rule on `main` refuses
a direct push. Squash is the only merge method enabled, so a branch lands as a
single commit and is deleted for you afterwards.

Turn auto-merge on when you open the PR, rather than coming back to merge it by
hand:

```bash
gh pr merge --squash --auto
```

The one required check is `ci`: the gate job at the end of
`.github/workflows/ci.yml`, which waits on `lint` and `verify` and reports their
combined result as a single status. Auto-merge holds the pull request until that
gate is green and merges it the moment it is, so a red gate parks the branch
instead of landing it.

`main` also requires signed commits. This is worth knowing because of how it
fails: an unsigned commit leaves the pull request permanently unmergeable no
matter how green `ci` goes, since it is the branch rule that refuses it and not
the check.

Do not open a pull request with nothing in it. An empty or make-work commit to
satisfy some other process is exactly the kind of thing a reader of this
repository will copy.
