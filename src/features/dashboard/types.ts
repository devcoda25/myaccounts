// Types for dashboard module

import React from 'react';
import { Variants } from 'framer-motion';

export interface IApp {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    url: string;
    color: string;
}

export interface MotionVariants extends Variants {
    hidden: { opacity: number } | { y: number; opacity: number };
    show: {
        opacity: number;
        transition?: { staggerChildren: number };
    } | { y: number; opacity: number };
}
