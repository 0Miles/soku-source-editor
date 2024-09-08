import { I18nField } from "./i18n-field"
import { ModuleRepository } from "./module-repository"

export type ModuleInfo = {
    name: string
    icon?: string
    banner?: string
    description?: string
    descriptionI18n?: I18nField[]
    author?: string
    repositories: ModuleRepository[]
    priority?: number
    versionNumbers: string[]
    recommendedVersionNumber: string
}