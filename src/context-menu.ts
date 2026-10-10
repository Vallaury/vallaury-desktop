import { clipboard, Menu, shell, type WebContents } from "electron";
import { canOpenOutside } from "./origin";

/**
 * The right-click menu a browser would give: spelling suggestions, cut/copy/paste, link actions. Electron shows none by default,
 * which makes a notes app feel broken. Italian labels, like the rest of the app.
 */
export function attach(contents: WebContents, openInside: (url: string) => boolean) {
    contents.on("context-menu", (_event, params) => {
        const items: Electron.MenuItemConstructorOptions[] = [];
        if (params.misspelledWord) {
            for (const word of params.dictionarySuggestions.slice(0, 5)) items.push({ label: word, click: () => contents.replaceMisspelling(word) });
            items.push({ label: "Aggiungi al dizionario", click: () => contents.session.addWordToSpellCheckerDictionary(params.misspelledWord) });
            items.push({ type: "separator" });
        }
        if (params.linkURL) {
            items.push(
                { label: "Apri", visible: openInside(params.linkURL) || canOpenOutside(params.linkURL), click: () => (openInside(params.linkURL) ? void contents.loadURL(params.linkURL) : void shell.openExternal(params.linkURL)) },
                { label: "Apri nel browser", visible: canOpenOutside(params.linkURL), click: () => void shell.openExternal(params.linkURL) },
                { label: "Copia indirizzo del link", click: () => clipboard.writeText(params.linkURL) },
                { type: "separator" },
            );
        }
        if (params.mediaType === "image" && params.srcURL) items.push({ label: "Copia immagine", click: () => contents.copyImageAt(params.x, params.y) }, { type: "separator" });
        if (params.isEditable) {
            items.push(
                { label: "Annulla", role: "undo", enabled: params.editFlags.canUndo },
                { label: "Ripeti", role: "redo", enabled: params.editFlags.canRedo },
                { type: "separator" },
                { label: "Taglia", role: "cut", enabled: params.editFlags.canCut },
                { label: "Copia", role: "copy", enabled: params.editFlags.canCopy },
                { label: "Incolla", role: "paste", enabled: params.editFlags.canPaste },
                { label: "Seleziona tutto", role: "selectAll" },
            );
        } else if (params.selectionText) {
            items.push({ label: "Copia", role: "copy" }, { label: "Seleziona tutto", role: "selectAll" });
        } else if (!params.linkURL) {
            items.push({ label: "Indietro", enabled: contents.navigationHistory.canGoBack(), click: () => contents.navigationHistory.goBack() }, { label: "Avanti", enabled: contents.navigationHistory.canGoForward(), click: () => contents.navigationHistory.goForward() }, { label: "Ricarica", role: "reload" });
        }
        const trimmed = items.filter((i, n, all) => !(i.type === "separator" && (n === 0 || n === all.length - 1 || all[n - 1]?.type === "separator")));
        if (trimmed.length) Menu.buildFromTemplate(trimmed).popup();
    });
}
