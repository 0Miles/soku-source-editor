import {
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'

import { useShared } from '../../contexts/shared'
import AddSourceDialog from './compontents/add-source.dialog'
import SourceListItem from './compontents/source.list-item'

export default function SourceListPage() {
    const { sources, refreshSources } = useShared()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)

    useMemo(() => {
        (async () => {
            if (!sources) {
                setLoading(true)
                await refreshSources()
                setLoading(false)
            }
        })()
    }, [refreshSources, sources])

    return <MultiLevelPageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading &&
            <>
                <div className="mb:8 grid grid-cols:1 gap:4">
                    {
                        !!sources?.length &&
                        sources.map((sourceInfo, index) =>
                            <SourceListItem key={index} sourceInfo={sourceInfo}/>
                        )
                    }
                    <AddSourceDialog></AddSourceDialog>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}