import { MotionVariants } from "./types";

// Get greeting based on current hour
export function getGreeting(): string {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
}

// Animation variants for container
export function getContainerVars(): MotionVariants {
    return {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
}

// Animation variants for items
export function getItemVars(): MotionVariants {
    return {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };
}

// Get background gradient based on theme mode
export function getPageBg(mode: string): string {
    if (mode === 'dark') {
        return 'radial-gradient(circle at 50% 0%, #1a2e29 0%, #07110F 100%)';
    }
    return 'radial-gradient(circle at 50% 0%, #e8fbf4 0%, #ffffff 100%)';
}
