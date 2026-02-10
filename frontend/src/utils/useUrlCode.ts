import { useState, useEffect, useCallback } from "react";
import {
    updateUrlWithCode,
    getCodeFromUrl,
    decompressCode, // Import legacy decompressor for sync init
} from "./urlCodec";

/**
 * Custom hook to manage code synchronization with URL
 * @param defaultCode - Default code to use if no code is in URL
 * @returns Object with code state and update function
 */
export function useUrlCode(defaultCode: string) {
    const [code, setCode] = useState(() => {
        // Optimistic sync check for legacy 'code' param to avoid flash of content
        // for old links.
        try {
            const url = new URL(window.location.href);
            const legacyCode = url.searchParams.get("code");
            if (legacyCode) {
                return decompressCode(legacyCode);
            }
        } catch (e) {
            console.error("Error parsing URL synchronously", e);
        }
        return defaultCode;
    });

    // Handle initial async load (for 'zc') and browser navigation
    useEffect(() => {
        let active = true;

        const loadCode = async () => {
            const urlCode = await getCodeFromUrl();
            if (active && urlCode) {
                // Only update if different to avoid cursor jumps or re-renders
                setCode((prev) => (prev !== urlCode ? urlCode : prev));
            }
        };

        loadCode();
        
        // Listen for popstate (back/forward)
        const handlePopState = async () => {
            const urlCode = await getCodeFromUrl();
            if (urlCode) {
                setCode(urlCode);
            } else {
                setCode(defaultCode);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            active = false;
            window.removeEventListener("popstate", handlePopState);
        };
    }, [defaultCode]);

    // Update URL when code changes (with debouncing)
    const updateCode = useCallback((newCode: string) => {
        setCode(newCode);

        // Debounce URL updates to avoid too many history entries
        const timeoutId = setTimeout(() => {
            updateUrlWithCode(newCode); // Now async, but we don't need to await it here
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    return [code, updateCode] as const;
}