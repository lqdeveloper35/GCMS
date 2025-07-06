import React from 'react';

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.68-.47-1.128-.47H10.5c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5H12c.83 0 1.5.67 1.5 1.5v.5c0 .83.67 1.5 1.5 1.5h.5c.83 0 1.5.67 1.5 1.5v.5c0 .83.67 1.5 1.5 1.5h.5c.83 0 1.5.67 1.5 1.5V20c2.209 0 4-1.791 4-4 0-5.5-4.5-10-10-10z" />
    </svg>
);