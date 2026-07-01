/**
 * Safely retrieves and consumes a post-login redirect target from localStorage.
 * Returns null if no valid target is found (prevents open redirect attacks).
 */
export function getSafeRedirectTarget(): string | null {
    const target = localStorage.getItem("minicode_post_login_redirect");
    if (target && target.startsWith("/") && !target.startsWith("//")) {
        localStorage.removeItem("minicode_post_login_redirect");
        return target;
    }
    return null;
}
