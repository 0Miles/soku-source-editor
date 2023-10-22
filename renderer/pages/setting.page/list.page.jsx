import { Spinner } from '@fluentui/react-components'
import PageContainer from '../../templates/page-container'

export default function SettingListPage() {
    return <>
        <PageContainer>
            <div className="@transition-up|.3s|cubic-bezier(0.14,1,0.34,1) w:full">
                <Spinner />
            </div>
        </PageContainer>
    </>
}