import { useState, useEffect, useCallback } from "react";
import {
    compressCode,
    decompressCode,
    updateUrlWithCode,
    getCodeFromUrl,
} from "./urlCodec";

/**
 * Custom hook to manage code synchronization with URL
 * @param defaultCode - Default code to use if no code is in URL
 * @returns Object with code state and update function
 */
export function useUrlCode(defaultCode: string) {
    const [code, setCode] = useState(() => {
        // Try to get code from URL first, fallback to default
        const urlCode = getCodeFromUrl();
        return urlCode || defaultCode;
    });

    // Update URL when code changes (with debouncing)
    const updateCode = useCallback((newCode: string) => {
        setCode(newCode);

        // Debounce URL updates to avoid too many history entries
        const timeoutId = setTimeout(() => {
            updateUrlWithCode(newCode);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    // Listen for URL changes (back/forward navigation)
    useEffect(() => {
        function handlePopState() {
            const urlCode = getCodeFromUrl();
            if (urlCode) {
                setCode(urlCode);
            } else {
                setCode(defaultCode);
            }
        }

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [defaultCode]);

    return [code, updateCode];
}
