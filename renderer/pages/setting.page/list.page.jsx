import { Input } from '@fluentui/react-components'
import PageContainer from '../../templates/page-container'
import { useTranslation } from 'react-i18next'
import { useShared } from '../../contexts/shared'
import giteeIcon from '../../icons/gitee.icon'
import githubIcon from '../../icons/github.icon'

export default function SettingListPage() {
    const { t } = useTranslation()
    const { config, setConfigValue } = useShared()
    return <>
        <PageContainer>
            <div className="flex flex:col px:16 py:12 mb:4 r:3 user-select:none bg:#2f2f30@dark bg:#eeeeee@light">
                <label htmlFor="githubToken" className="mb:8 flex align-items:center gap:8">
                    {githubIcon}
                    {t('Github Token')}
                </label>

                <Input id="githubToken" defaultValue={config?.githubToken ?? ''} onChange={(_, data) => { setConfigValue('githubToken', data.value) }} />
            </div>
            <div className="flex flex:col px:16 py:12 r:3 user-select:none bg:#2f2f30@dark bg:#eeeeee@light">
                <label htmlFor="giteeToken" className="mb:8 flex align-items:center gap:8">
                    {giteeIcon}
                    {t('Gitee Token')}
                </label>

                <Input id="giteeToken" defaultValue={config?.giteeToken ?? ''} onChange={(_, data) => { setConfigValue('giteeToken', data.value) }} />
            </div>
        </PageContainer>
    </>
}