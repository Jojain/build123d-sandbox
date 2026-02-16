/**
 * Utility functions for compressing and decompressing code in URLs
 */

// Check for native compression support
const SUPPORTS_COMPRESSION =
    typeof CompressionStream !== "undefined" &&
    typeof DecompressionStream !== "undefined" &&
    typeof TextEncoder !== "undefined" &&
    typeof TextDecoder !== "undefined";

/**
 * Legacy: Compresses code for URL storage (Base64 only)
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
 * Legacy: Decompresses code from URL (Base64 only)
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
 * Compresses code using deflate and Base64 (Async)
 * @param code - The code string
 */
export async function compressCodeDeflate(code: string): Promise<string> {
    try {
        // 1. Deflate compress
        const stream = new Blob([code]).stream().pipeThrough(new CompressionStream("deflate"));
        const response = new Response(stream);
        const buffer = await response.arrayBuffer();

        // 2. Convert binary to Base64 (URL safe)
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        // Use a loop to avoid stack overflow with large files
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        const base64 = btoa(binary);
        return base64
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    } catch (error) {
        console.error("Error compressing with deflate:", error);
        return "";
    }
}

/**
 * Decompresses code using Deflate and Base64 (Async)
 * @param compressedCode - The compressed string from URL
 */
export async function decompressCodeDeflate(compressedCode: string): Promise<string> {
    try {
        // 1. Restore Base64
        let base64 = compressedCode.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
            base64 += "=";
        }
        const binary = atob(base64);
        
        // 2. Convert to Uint8Array
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // 3. Deflate decompress
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
        const response = new Response(stream);
        return await response.text();
    } catch (error) {
        console.error("Error decompressing deflate code:", error);
        return "";
    }
}

/**
 * Updates the URL with compressed code (Async)
 * Prioritizes 'zc' if supported, falls back to 'code'
 */
export async function updateUrlWithCode(code: string): Promise<void> {
    try {
        const url = new URL(window.location.href);

        if (code) {
            if (SUPPORTS_COMPRESSION) {
                const compressed = await compressCodeDeflate(code);
                if (compressed) {
                     // Warn if URL is getting too long (browser dependent, safe buffer 8k)
                    if (url.toString().length + compressed.length > 8000) {
                        console.warn("Code is too long for URL storage. Consider shortening your code.");
                        return;
                    }
                    url.searchParams.set("zc", compressed);
                    url.searchParams.delete("code"); // Remove legacy param
                }
            } else {
                // Fallback for older browsers
                const compressed = compressCode(code);
                if (compressed) {
                    url.searchParams.set("code", compressed);
                    url.searchParams.delete("zc");
                }
            }
        } else {
            url.searchParams.delete("code");
            url.searchParams.delete("zc");
        }

        window.history.replaceState({}, "", url.toString());
    } catch (error) {
        console.error("Error updating URL:", error);
    }
}

/**
 * Retrieves code from URL parameters (Async)
 * Checks 'zc' first, then 'code'
 */
export async function getCodeFromUrl(): Promise<string> {
    try {
        const url = new URL(window.location.href);
        const zCode = url.searchParams.get("zc");
        const legacyCode = url.searchParams.get("code");

        // Try deflate first
        if (zCode && SUPPORTS_COMPRESSION) {
            const code = await decompressCodeDeflate(zCode);
            if (code) return code;
        }

        // Fallback to legacy
        if (legacyCode) {
            return decompressCode(legacyCode);
        }

        return "";
    } catch (error) {
        console.error("Error getting code from URL:", error);
        return "";
    }
}
