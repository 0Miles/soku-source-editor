import { ModuleInfo } from "./module-info"
import { ModuleSummary } from "./module-summary"

export type SourceInfo = {
    name: string
    url: string
    moduleSummaries: ModuleSummary[]
    modules: ModuleInfo[]
    preferredDownloadLinkType: string
}