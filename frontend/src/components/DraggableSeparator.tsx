import * as React from "react";
import Box from "@mui/material/Box";

interface DraggableSeparatorProps {
    onResize: (newPercentage: number) => void;
    currentPercentage: number;
    minPercentage: number;
    maxPercentage: number;
    orientation: "horizontal" | "vertical";
}

function DraggableSeparator({ 
    onResize, 
    currentPercentage, 
    minPercentage, 
    maxPercentage,
    orientation
}: DraggableSeparatorProps) {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = React.useCallback((event: MouseEvent) => {
        if (!isDragging) return;

        const isHorizontal = orientation === "horizontal";
        const containerSize = isHorizontal ? window.innerWidth : window.innerHeight;
        const clientPosition = isHorizontal ? event.clientX : event.clientY;
        const newPercentage = (clientPosition / containerSize) * 100;
        
        // Clamp the value between min and max
        const clampedPercentage = Math.max(minPercentage, Math.min(maxPercentage, newPercentage));
        
        onResize(clampedPercentage);
    }, [isDragging, onResize, minPercentage, maxPercentage, orientation]);

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const isHorizontal = orientation === "horizontal";
    const cursor = isHorizontal ? 'col-resize' : 'row-resize';
    const separatorWidth = isHorizontal ? '8px' : '100%';
    const separatorHeight = isHorizontal ? '100%' : '8px';
    const indicatorWidth = isHorizontal ? '2px' : '40px';
    const indicatorHeight = isHorizontal ? '40px' : '2px';

    return (
        <Box
            sx={{
                width: separatorWidth,
                height: separatorHeight,
                backgroundColor: isDragging ? 'primary.main' : 'grey.300',
                cursor: cursor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                    backgroundColor: 'primary.light',
                },
                '&::before': {
                    content: '""',
                    width: indicatorWidth,
                    height: indicatorHeight,
                    backgroundColor: isDragging ? 'white' : 'grey.500',
                    borderRadius: '1px',
                },
                userSelect: 'none',
                flexShrink: 0,
            }}
            onMouseDown={handleMouseDown}
        />
    );
}

export default DraggableSeparator;
