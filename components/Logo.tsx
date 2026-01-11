import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      width="23" 
      height="20" 
      viewBox="0 0 23 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0.542109" y="0.542109" width="21.3137" height="18.4237" fill="#0038DF"/>
      <rect x="0.542109" y="0.542109" width="21.3137" height="18.4237" stroke="black" strokeWidth="1.08375"/>
      <rect x="0.542109" y="0.542109" width="21.3137" height="18.4237" fill="#0038DF"/>
      <rect x="0.542109" y="0.542109" width="21.3137" height="18.4237" stroke="black" strokeWidth="1.08375"/>
      <path d="M9.58398 10.084V1.08398H21.3145V18.433H10.084L12.084 10.084H9.58398Z" fill="white"/>
      <path d="M10.084 8.58398L13.084 2.08398C13.084 2.08398 11.6698 2.27925 11.084 2.08398C10.4982 1.88872 9.58398 1.08398 9.58398 1.08398L6.08398 12.584L11.084 11.084L10.084 14.084L8.58398 13.084L10.084 18.584L14.084 15.084H12.084L15.084 7.08398L10.084 8.58398Z" fill="black" stroke="black" strokeWidth="0.1" strokeLinecap="round"/>
    </svg>
  );
};

export default Logo;
