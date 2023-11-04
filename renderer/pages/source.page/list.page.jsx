import {
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useMemo, useState, useContext } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'

import { DataContext } from '../../data'
import AddSourceDialog from './compontents/add-source.dialog'
import SourceListItem from './compontents/source.list-item'

export default function SourceListPage() {
    const { sources, refreshSources } = useContext(DataContext)
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
                <div className="mb:8 grid grid-cols:1 gap:8 w:full">
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