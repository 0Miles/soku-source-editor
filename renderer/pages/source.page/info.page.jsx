import { Button, Spinner } from '@fluentui/react-components'
import PageContainer from '../../templates/page-container'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import { useModSource } from '../../contexts/mod-source'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import SourceListItem from './compontents/source.list-item'
import AddSourceDialog from './compontents/add-source.dialog'
import CommonItem from '../../common/common-item'

export default function SourceInfoPage() {
    const { sources, refreshSources } = useModSource()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)

    return <MultiLevelPageContainer level={3}>
        {
            loading &&
            <Spinner />
        }
        {
            !loading &&
            <>
                <div className="flex flex:col">
                    <CommonItem
                        title={t('No primary source set')}
                        desc={t('You must first add at least one source and set a primary source')}
                        footer={
                            <Button onClick={() => { navigate('/source') }}>{t('Set up now')}</Button>
                        }
                    ></CommonItem>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}