import * as React from "react";
import Box from "@mui/material/Box";

interface DraggableSeparatorProps {
    onResize: (newLeftPercentage: number) => void;
    currentLeftPercentage: number;
    minLeftPercentage: number;
    maxLeftPercentage: number;
}

function DraggableSeparator({ 
    onResize, 
    currentLeftPercentage, 
    minLeftPercentage, 
    maxLeftPercentage 
}: DraggableSeparatorProps) {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = React.useCallback((event: MouseEvent) => {
        if (!isDragging) return;

        const containerWidth = window.innerWidth;
        const newLeftPercentage = (event.clientX / containerWidth) * 100;
        
        // Clamp the value between min and max
        const clampedPercentage = Math.max(minLeftPercentage, Math.min(maxLeftPercentage, newLeftPercentage));
        
        onResize(clampedPercentage);
    }, [isDragging, onResize, minLeftPercentage, maxLeftPercentage]);

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

    return (
        <Box
            sx={{
                width: '8px',
                backgroundColor: isDragging ? 'primary.main' : 'grey.300',
                cursor: 'col-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                    backgroundColor: 'primary.light',
                },
                '&::before': {
                    content: '""',
                    width: '2px',
                    height: '40px',
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
