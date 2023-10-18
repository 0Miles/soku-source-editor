import {
    Spinner,
    MenuItem,
    Button
} from '@fluentui/react-components'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../templates/page-container'
import Temp from '../../temp'
import { getMods } from '../../common/api'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import boxIcon from '../../icons/box.icon'
import CollapsibleButton from '../../common/collapsible.button'
import HTMLReactParser from 'html-react-parser'
import { Marked } from 'marked'

const marked = new Marked()

export default function ModuleInfoPage() {
    const { modName } = useParams()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [modInfo, setModInfo] = useState(null)

    useMemo(() => {
        (async () => {
            if (!Temp['mods']) {
                setLoading(true)
                const data = await getMods()
                setModInfo(data.find(x => x.name === modName))
                setLoading(false)
            } else {
                setModInfo(Temp['mods'].find(x => x.name === modName))
            }
        })()
    }, [modName])

    return <PageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading && !!modInfo &&
            <>
                <div className={`rel w:full overflow:hidden pt:60 p:24 mb:16 border-radius:6|6|0|0 bg:linear-gradient(rgba(0,0,0,.65)|0%,rgba(32,32,32,.9)|60%,rgba(32,32,32,1)|75%)@dark bg:linear-gradient(rgba(200,200,200,.65)|0%,rgba(255,255,255,.85)|60%,rgba(255,255,255,1)|75%)@light`}>
                    {
                        !!modInfo.banner &&
                        <img src={modInfo.banner} className="abs z:-1 top:0 left:0 w:full h:80% object-fit:cover" />
                    }
                    <div className="flex w:full align-items:center justify-content:center">
                        <div className="flex aspect:1/1 flex:0|0|120px h:full overflow:hidden align-items:center justify-content:center bg:gray/.2">
                            {
                                !!modInfo.icon &&
                                <img src={modInfo.icon} className="obj:cover w:full h:full" />
                            }
                            {
                                !modInfo.icon &&
                                <div className="flex w:full h:full align-items:center justify-content:center bg:gray/.2">
                                    {gearIcon}
                                </div>
                            }
                        </div>
                        <div className="flex flex:1 w:0 flex:col text-align:left mx:24 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                            <div className="f:32 line-height:normal font-weight:bold">
                                {modInfo.name}
                            </div>
                            <div className="my:8 font-weight:normal">
                                {modInfo.desc}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my:10 grid grid-cols:1 gap:6 w:full">
                    {
                        modInfo?.versions &&
                        modInfo.versions.map((version, i) => 
                            <CollapsibleButton
                                key={i}
                                icon={boxIcon}
                                body={<>
                                    <div className="flex:1 w:0 {my:2;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                        <div className="f:18">
                                            v{version.version}
                                        </div>
                                        <div className="f:12 line-height:12px">
                                            尚未發佈
                                        </div>
                                    </div>
                                </>}
                                content={<>
                                    <div className="flex align-items:center justify-content:space-between">
                                        <div className="">
                                            發佈到 Github
                                            <div className="font-weight:normal color:#AAA@dark">
                                                需先登入並設定模組的 Github Repository
                                            </div>
                                        </div>
                                        <Button disabled>發佈</Button>
                                    </div>
                                    <div>
                                        <div className="flex align-items:center justify-content:space-between mb:16">
                                            <div className="">
                                                內容
                                            </div>
                                            <Button>編輯</Button>
                                        </div>
                                        <div className="grid grid-template-cols:max-content|4|auto gap:8">
                                            <div className="grid-col:1">
                                                主要檔案:
                                            </div>
                                            <div className="grid-col:3 f:16 color:#AAA@dark">
                                                {version.main}
                                            </div>
                                            <div className="grid-col:1">
                                                設定檔案:
                                            </div>
                                            <div className="grid-col:3 f:16 color:#AAA@dark">
                                                {
                                                    !!version.configFiles?.length &&
                                                    version.configFiles.map((fileName, i) => <div key={i}>{fileName}</div>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className=" mb:16">發佈說明</div>
                                        <div className="r:3 my:8>p color:#5db0d7>*>a@dark color:blue>*>a@light">
                                            {
                                                HTMLReactParser(
                                                    marked.parse(version.notes)
                                                )
                                            }
                                        </div>
                                    </div>
                                </>
                                }
                            />
                        )
                    }
                </div>
                <Button className="w:full min-h:80" appearance="subtle">
                    {plusIcon}
                </Button>
            </>
        }
    </PageContainer>
}