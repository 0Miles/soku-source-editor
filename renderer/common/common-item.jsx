
export default function CommonItem({ icon, fullIcon, title, desc, footer, end, onClick }) {

    return (
        <div onClick={onClick} className={`min-h:68 flex flex:1 align-items:center justify-content:space-between r:3 user-select:none bg:#2f2f30@dark bg:#eeeeee@light ${!!onClick ? 'bg:#2f2f30:active@dark bg:#383838:hover@dark bg:#eeeeee:active@light bg:#f5f5f5:hover@light' : ''}`}>
            {
                !!icon && !fullIcon &&
                <div className="w:24 ml:16 mt:4 overflow:clip">
                    {icon}
                </div>
            }
            {
                !!icon && fullIcon &&
                <div className="flex aspect:1/1 w:70 h:full overflow:clip">
                    {icon}
                </div>
            }
            <div className="flex flex:col flex:1 w:0 mx:16 py:12 {my:2;line-height:1rem;font-weight:normal}>div">
                <div>
                    {title}
                </div>
                {
                    !!desc &&
                    <div className="white-space:nowrap text-overflow:ellipsis overflow:clip f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                        {desc}
                    </div>
                }
            </div>
            {
                !!footer &&
                <div className="mr:16">
                    {footer}
                </div>
            }
            {
                !!end &&
                <div className="mr:12 mt:4">
                    {end}
                </div>
            }
        </div>
    )
}