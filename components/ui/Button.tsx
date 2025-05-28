
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`font-medium rounded-lg focus:outline-none transition duration-150 ease-in-out ${className}`}
    >
      {children}
    </button>
  );
};
    