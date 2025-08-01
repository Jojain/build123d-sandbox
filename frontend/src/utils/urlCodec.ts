/**
 * Utility functions for compressing and decompressing code in URLs
 */

/**
 * Compresses code for URL storage
 * @param code - The Python code to compress
 * @returns Compressed code string safe for URLs
 */
export function compressCode(code: string): string {
    try {
        // Convert to base64 and make URL-safe
        const base64 = btoa(unescape(encodeURIComponent(code)));
        return base64
            .replace(/\+/g, "-") // Replace + with -
            .replace(/\//g, "_") // Replace / with _
            .replace(/=/g, ""); // Remove padding
    } catch (error) {
        console.error("Error compressing code:", error);
        return "";
    }
}

/**
 * Decompresses code from URL
 * @param compressedCode - The compressed code from URL
 * @returns Decompressed Python code
 */
export function decompressCode(compressedCode: string): string {
    try {
        // Restore base64 padding and URL-safe characters
        let base64 = compressedCode
            .replace(/-/g, "+") // Replace - with +
            .replace(/_/g, "/"); // Replace _ with /

        // Add padding if needed
        while (base64.length % 4) {
            base64 += "=";
        }

        // Decode base64 and convert back to string
        return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
        console.error("Error decompressing code:", error);
        return "";
    }
}

/**
 * Updates the URL with compressed code
 * @param code - The Python code to store in URL
 */
export function updateUrlWithCode(code: string): void {
    try {
        const compressedCode = compressCode(code);
        const url = new URL(window.location.href);

        if (compressedCode) {
            // Check if URL would be too long (browsers typically have ~2000-8000 char limits)
            const testUrl = new URL(window.location.href);
            testUrl.searchParams.set("code", compressedCode);

            if (testUrl.toString().length > 6000) {
                console.warn(
                    "Code is too long for URL storage. Consider shortening your code.",
                );
                return;
            }

            url.searchParams.set("code", compressedCode);
        } else {
            url.searchParams.delete("code");
        }

        // Update URL without reloading the page
        window.history.replaceState({}, "", url.toString());
    } catch (error) {
        console.error("Error updating URL:", error);
    }
}

/**
 * Retrieves code from URL parameters
 * @returns The decompressed code from URL, or empty string if not found
 */
export function getCodeFromUrl(): string {
    try {
        const url = new URL(window.location.href);
        const compressedCode = url.searchParams.get("code");

        if (compressedCode) {
            return decompressCode(compressedCode);
        }

        return "";
    } catch (error) {
        console.error("Error getting code from URL:", error);
        return "";
    }
}
