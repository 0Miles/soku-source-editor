import { Spinner } from "@fluentui/react-components"
import { useTranslation } from "react-i18next"

export default function GitStatus({ gitStatus, isSyncing }) {
    const { t } = useTranslation()
    return <div className="flex align-items:center">
        {
            !gitStatus &&
            <Spinner appearance="inverted" size="extra-tiny" />
        }
        {
            gitStatus &&
            <svg className={`${isSyncing ? '@rotate|1s|infinite|reverse' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
            </svg>
        }

        {
            gitStatus &&
            (gitStatus.behind > 0 || gitStatus.ahead > 0) &&

            <>
                <div className="ml:4 flex align-items:center">
                    {gitStatus.behind}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 5l0 14"></path>
                        <path d="M16 15l-4 4"></path>
                        <path d="M8 15l4 4"></path>
                    </svg>
                </div>

                <div className="flex align-items:center">
                    {gitStatus.ahead}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 5l0 14"></path>
                        <path d="M16 9l-4 -4"></path>
                        <path d="M8 9l4 -4"></path>
                    </svg>
                </div>
            </>
        }
    </div>
}