export default function PageContainer({ children, className }) {
    return (
        <div className={`
                    ${className ?? ''}
                    w:full h:full 
                    px:24 py:10 pr:42@<sm 
                    overflow-y:auto
                    hide::-webkit-scrollbar-button
                    {bg:white;w:12}::-webkit-scrollbar@light
                    {bg:white}::-webkit-scrollbar-track@light
                    {bg:#babac0;border-radius:12;b:4|solid|white}::-webkit-scrollbar-thumb@light
                    {bg:#202020;w:12;abs}::-webkit-scrollbar@dark
                    {bg:#202020;abs}::-webkit-scrollbar-track@dark
                    {bg:#959595;border-radius:12;b:4|solid|#202020;abs}::-webkit-scrollbar-thumb@dark
                `}>
            {children}
        </div>)
}