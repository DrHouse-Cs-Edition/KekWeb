import React, { useState, useEffect } from 'react';
import Calendario from '../components/calendario/desktop/Calendario.jsx';
import CalendarioMobile from '../components/calendario/mobile/mobileCalendar.jsx';

function Calendar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount

    return(
        <>
            {isMobile ? <CalendarioMobile /> : <Calendario />}
        </>
    )
}

export default Calendar;