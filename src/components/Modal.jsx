function Modal({children, onClose}){
return(
    <div className="w-full h-full fixed inset-0 bg-black/50 z-50" onClick={onClose}>
        <div onClick={(e)=> e.stopPropagation()} className="bg-white rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 w-full max-w-5xl">
            {children}
        </div>
    </div>
)
}
export default Modal;