import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useThemeStore } from "../../stores/themeStore";
import { EVZONE } from "../../theme/evzone";

export default function RouteLoader() {
    const { mode } = useThemeStore();
    const isDark = mode === "dark";

    // Use a solid background that matches the app theme
    // Dark: #07110F (from App theme)
    // Light: #F4FFFB (from App theme)
    const bg = isDark ? "#07110F" : "#F4FFFB";

    const dots = Array.from({ length: 12 });

    return (
        <Box
            className="min-h-screen"
            sx={{
                display: "grid",
                placeItems: "center",
                backgroundColor: bg,
                transition: "background-color 0.3s ease",
            }}
        >
            <Box sx={{ position: "relative", width: 64, height: 64, display: "grid", placeItems: "center" }}>
                {dots.map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            transform: `rotate(${i * 30}deg)`,
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: "calc(50% - 5px)", // 10px dot
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: EVZONE.orange,
                            }}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut",
                            }}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
