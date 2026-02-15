function Footer(){
    return (
        <div className="w-full bg-white border-t border-t-gray-200 py-6 flex flex-col items-center gap-4 ">
            <img src="https://enohm.net/wp-content/uploads/2024/06/cropped-gif.webp" className='w-[200px] h-[45px]' />
        <div className="grid grid-cols-3 w-full md:w-[85%] mt-3 border-b border-b-gray-600" >
            <div className="flex flex-col items-center ">
                <p className="text-blue-950 text-xl font-bold">Adresss</p>
            <ul className="text-gray-500 *:my-1">
                <li>Enohm GmbH</li>
                <li>Wallstr. 17</li>
                <li>01067 Dresden</li>
            </ul>
            </div>

                        <div className="flex flex-col items-center">
                <p className="text-blue-950 text-xl font-bold">Kontakt</p>
            <ul className="text-gray-500 *:my-1">
                <li>Tel.: <a href="tel:0152 266 777 00 " className="text-blue-900 underline">0152 266 777 00 </a> </li>
                <li>E-mail: <a href="mailto:info@enohm.de" className="text-blue-900 underline">info@enohm.de</a></li>
            </ul>
            </div>

                        <div className="flex flex-col items-center">
                <p className="text-blue-950 text-xl font-bold">Weitere Links</p>
            <ul className="text-gray-500 *:my-1">
                <li>Impressum</li>
                <li>Datenschutz</li>
            </ul>
            </div>
            

            </div>
            
                <p className="mb-3 text-gray-500"> © 2024 Enohm GmbH</p>
            
        </div>
    )
}
export default Footer;