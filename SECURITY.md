# Security Policy

## Supported Scope

Aperture is currently a local proof of concept. Security reports should focus on the public repository, local scanner behavior, dashboard behavior, generated output, and project documentation.

## Reporting

Please open a private security advisory if available, or contact the maintainer privately before publishing details. Avoid posting secrets, private repository paths, or sensitive scanner output in public issues.

## Local Data Principles

Aperture should:

- Keep project inventory data local by default.
- Treat scanner output as potentially sensitive because it can contain paths, Git metadata, and filenames.
- Avoid uploading workspace data unless a future feature asks for explicit user consent.
- Keep scanner operations read-only.
- Avoid collecting file contents unless a narrowly scoped feature requires it and documents why.

## Not A Vulnerability Scanner

Aperture's V1 Risk Radar is local launch hygiene, not full vulnerability scanning. Findings are heuristics based on observable local files and should be treated as prompts for human review.

