'use client'

import Timer from '@/ui/Timer';

export default function Finished() {

    return(
        <div className='h-screen flex flex-col items-center text-center'>
            <header className='m-8 w-screen'>
                <Timer />
            </header>
        </div>
        
    )
}