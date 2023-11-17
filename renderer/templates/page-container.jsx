export default function PageContainer({ children, className }) {
    return (
        <div className={`
                    ${className ?? ''}
                    h:full 
                    px:24 pb:24 pr:42@<sm 
                    overflow-y:auto
                `}>
            {children}
        </div>)
}