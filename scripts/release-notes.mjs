// Writes the text of a GitHub release: the install guide (.github/release-notes.md) and the changelog section of the version.
// Usage: node scripts/release-notes.mjs 0.1.2 > notes.md
import { readFileSync } from "node:fs";

const version = (process.argv[2] ?? "").replace(/^v/, "");
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error("Usage: node scripts/release-notes.mjs <version>");
    process.exit(1);
}
const root = new URL("..", import.meta.url);
const template = readFileSync(new URL(".github/release-notes.md", root), "utf8");
const changelog = readFileSync(new URL("CHANGELOG.md", root), "utf8");
const match = changelog.match(new RegExp(`^## ${version.replace(/\./g, "\\.")}\\b.*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
const changes = match ? match[1].trim() : "Vedi [CHANGELOG.md](https://github.com/Vallaury/vallaury-desktop/blob/main/CHANGELOG.md).";
process.stdout.write(template.replaceAll("{{VERSION}}", version).replace("{{CHANGES}}", () => changes));
