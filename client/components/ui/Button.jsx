import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false
}) => {
    const baseStyles = "px-8 py-3 font-serif tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gold-400 text-dark-900 hover:bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]",
        secondary: "bg-dark-800 text-stone-100 hover:bg-dark-900 border border-dark-800 hover:border-gold-400/50",
        outline: "bg-transparent border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-dark-900",
        ghost: "bg-transparent text-stone-300 hover:text-gold-400"
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;
