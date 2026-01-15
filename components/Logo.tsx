import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  delay?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, delay = 0 }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delayVal = delay + i * 0.2;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay: delayVal, type: "spring", duration: 1.5, bounce: 0 },
          opacity: { delay: delayVal, duration: 0.01 }
        }
      };
    }
  };

  return (
    <motion.svg
      width="23"
      height="20"
      viewBox="0 0 23 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.rect
        variants={draw}
        custom={0}
        x="0.542109" y="0.542109" width="21.3137" height="18.4237"
        stroke="black" strokeWidth="1.08375"
        fill="#0038DF"
        fillOpacity={0}
        animate={{ fillOpacity: 1 }}
        transition={{ delay: delay + 1.2, duration: 0.5 }}
      />
      <motion.rect
        variants={draw}
        custom={0.2}
        x="0.542109" y="0.542109" width="21.3137" height="18.4237" stroke="black" strokeWidth="1.08375"
      />

      <motion.path
        variants={draw}
        custom={0.5}
        d="M9.58398 10.084V1.08398H21.3145V18.433H10.084L12.084 10.084H9.58398Z"
        fill="white"
        fillOpacity={0}
        stroke="white"
        strokeWidth="0.5"
        animate={{ fillOpacity: 1, strokeOpacity: 0 }}
        transition={{
          fillOpacity: { delay: delay + 1.5, duration: 0.5 },
          strokeOpacity: { delay: delay + 1.5, duration: 0.5 }
        }}
      />
      <motion.path
        variants={draw}
        custom={1}
        d="M10.084 8.58398L13.084 2.08398C13.084 2.08398 11.6698 2.27925 11.084 2.08398C10.4982 1.88872 9.58398 1.08398 9.58398 1.08398L6.08398 12.584L11.084 11.084L10.084 14.084L8.58398 13.084L10.084 18.584L14.084 15.084H12.084L15.084 7.08398L10.084 8.58398Z"
        stroke="black" strokeWidth="0.1" strokeLinecap="round"
        fill="black"
        fillOpacity={0}
        animate={{ fillOpacity: 1 }}
        transition={{ delay: delay + 1.8, duration: 0.4 }}
      />
    </motion.svg>
  );
};

export default Logo;
