# Security policy

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's
[private vulnerability reporting](https://github.com/mielsense/evilcharts-sv/security/advisories/new)
to share the affected route or registry item, impact, reproduction, and any suggested mitigation.

Remove access tokens, private project data, personal paths, and unrelated user content from logs,
screenshots, or sample repositories. Please allow the maintainer time to reproduce and coordinate a
fix before public disclosure.

## Supported code

This project is a source registry and documentation site, not a versioned npm package. Security fixes
target the current `main` branch and the production registry at <https://evilcharts-sv.vercel.app/>.
Components already copied into another project do not update automatically; consumers must reinstall
the affected registry item or apply the published source change.

The ignored local `evilcharts/` and `dither-kit/` reference checkouts are outside this repository's
security and support boundary.
