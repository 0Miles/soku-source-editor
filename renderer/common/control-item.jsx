
export default function ControlItem({ title, desc, control }) {

    return (
        <div className="flex my:2>div align-items:center justify-content:space-between r:3 p:16 bg:#2f2f30@dark bg:#eeeeee@light user-select:none justify-content:space-between">
            <div className="flex:1">
                <div>
                    {title}
                </div>
                {
                    !!desc &&
                    <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                        {desc}
                    </div>
                }
            </div>
            {
                control
            }
        </div>
    )
}