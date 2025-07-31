import { useEffect, useRef, useState } from "react";

interface Size {
    width: number;
    height: number;
}

function useResizeObserver(onResize: (size: Size) => void): [React.RefObject<HTMLElement>, Size] {
    const elementRef = useRef<HTMLElement>(null);
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const newSize = { width, height };
                setSize(newSize);
                
                // Call the optional callback
                if (onResize) {
                    onResize(newSize);
                }
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [onResize]);

    return [elementRef as React.RefObject<HTMLElement>, size];
}

export default useResizeObserver; 