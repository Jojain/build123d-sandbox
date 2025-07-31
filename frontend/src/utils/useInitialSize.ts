import { useEffect, useState, useRef } from "react";

interface Size {
    width: number;
    height: number;
}

function useInitialSize(ref: React.RefObject<HTMLElement | null>): Size {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });
    const hasMeasured = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || hasMeasured.current) return;

        // Get the initial size
        const rect = element.getBoundingClientRect();
        const initialSize = { 
            width: rect.width, 
            height: rect.height 
        };
        
        setSize(initialSize);
        hasMeasured.current = true;
    }, [ref]);

    return size;
}

export default useInitialSize; 