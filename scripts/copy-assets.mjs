// Pages the window shows itself (the offline screen) are plain files next to the compiled code.
import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/pages", { recursive: true });
cpSync("src/pages", "dist/pages", { recursive: true });
