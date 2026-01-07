import React from "react";
import { Box, Button, IconButton, Select, MenuItem, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type PaginationProps = {
    page: number; // 0-indexed
    count: number; // Total items
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange?: (newRows: number) => void;
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" };

export default function Pagination({
    page,
    count,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: PaginationProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const totalPages = Math.ceil(count / rowsPerPage);
    const start = page * rowsPerPage + 1;
    const end = Math.min((page + 1) * rowsPerPage, count);

    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    // Generate page numbers to show (max 5)
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(0, page - 2);
        let endPage = Math.min(totalPages - 1, page + 2);

        if (totalPages <= 5) {
            startPage = 0;
            endPage = totalPages - 1;
        } else {
            if (page <= 2) {
                endPage = 4;
            } else if (page >= totalPages - 3) {
                startPage = totalPages - 5;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            // Ensure i is valid before pushing (though the logic above handles limits, extra safety helps)
            if (i >= 0 && i < totalPages) pages.push(i);
        }
        return pages;
    };

    const orangeOutlinedInfo = {
        color: theme.palette.text.secondary,
        backgroundColor: alpha(theme.palette.background.paper, 0.45),
        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        borderRadius: 3,
        "&:hover": {
            borderColor: EVZONE.orange,
            color: EVZONE.orange,
        },
        // Styles for active state (if valid button)
        "&.Mui-disabled": {
            opacity: 0.5,
            borderColor: 'transparent'
        }
    };


    const pageBtnStyle = (active: boolean) => active ? {
        minWidth: 36,
        height: 36,
        borderRadius: 10, // fully rounded or soft rect? "Classy" often means soft sq.
        backgroundColor: EVZONE.green,
        color: "#fff",
        boxShadow: `0 4px 12px ${alpha(EVZONE.green, 0.4)}`,
        fontWeight: 900,
        "&:hover": { backgroundColor: alpha(EVZONE.green, 0.9) }
    } : {
        minWidth: 36,
        height: 36,
        borderRadius: 10,
        color: theme.palette.text.primary,
        "&:hover": { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
    };

    if (count === 0) return null;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mt: 2,
                p: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Showing <b>{start}</b> to <b>{end}</b> of <b>{count}</b> entries
                </Typography>

                {onRowsPerPageChange && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Rows:</Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 32,
                                borderRadius: 3,
                                borderColor: alpha(theme.palette.text.primary, 0.1),
                                fontSize: '0.875rem',
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(theme.palette.text.primary, 0.15) }
                            }}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(0)}
                    disabled={!canPrev}
                    sx={{ ...orangeOutlinedInfo, width: 36, height: 36 }}
                >
                    <ChevronsLeft size={18} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canPrev}
                    sx={{ ...orangeOutlinedInfo, width: 36, height: 36, mr: 1 }}
                >
                    <ChevronLeft size={18} />
                </IconButton>

                {getPageNumbers().map((p) => (
                    <Button
                        key={p}
                        size="small"
                        onClick={() => onPageChange(p)}
                        sx={pageBtnStyle(p === page)}
                    >
                        {p + 1}
                    </Button>
                ))}

                <IconButton
                    size="small"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canNext}
                    sx={{ ...orangeOutlinedInfo, width: 36, height: 36, ml: 1 }}
                >
                    <ChevronRight size={18} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={!canNext}
                    sx={{ ...orangeOutlinedInfo, width: 36, height: 36 }}
                >
                    <ChevronsRight size={18} />
                </IconButton>
            </Box>
        </Box>
    );
}
