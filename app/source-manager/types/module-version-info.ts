import { I18nField } from "./i18n-field"
import { ModuleVersionDownloadLink } from "./module-version-download-link"

export type ModuleVersionInfo = {
    version: string
    notes: string
    notesI18n: I18nField[]
    main: string
    configFiles: string[]
    downloadLinks: ModuleVersionDownloadLink[]
}