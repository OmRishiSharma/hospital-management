/**
 * getSubdomain — Resolves the current tenant slug from the browser URL.
 *
 * Priority order:
 *   1. ?slug= query param  (Vercel-compatible fallback — always works)
 *   2. Subdomain of VITE_BASE_DOMAIN  (custom domain: admit.medicalhms.in)
 *   3. Subdomain of *.localhost  (local dev: admit.localhost)
 *   4. Full hostname if it's not the base domain  (custom hospital domain)
 *   5. null  (no tenant detected — renders CentralAdminLogin)
 *
 * Vercel note:
 *   Vercel does NOT support wildcard subdomains on *.vercel.app.
 *   All *.vercel.app URLs return null — hospital portals must use ?slug=
 *   For production wildcard subdomains, set VITE_BASE_DOMAIN=yourdomain.com
 *   and add *.yourdomain.com to Vercel domains.
 */
export const getSubdomain = () => {
    // 1. ?slug= query param always takes priority (works on Vercel, localhost, everywhere)
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('slug');
    if (querySlug) return querySlug.toLowerCase().trim();

    const hostname = window.location.hostname.toLowerCase();

    // 2. Raw IP or bare localhost — no tenant
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === 'localhost') {
        return null;
    }

    // 3. *.vercel.app — Vercel does not support wildcard subdomains here.
    //    Return null unconditionally; hospital portals use ?slug= on Vercel.
    if (hostname.endsWith('.vercel.app') || hostname === 'vercel.app') {
        return null;
    }

    // 4. Custom base domain (VITE_BASE_DOMAIN env var, e.g. medicalhms.in)
    const baseDomain = (import.meta.env.VITE_BASE_DOMAIN || 'medicalhms.in').toLowerCase().trim();

    // Exact match = base domain itself, no subdomain
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
        return null;
    }

    // Subdomain of base domain  (admit.medicalhms.in → 'admit')
    if (hostname.endsWith(`.${baseDomain}`)) {
        const sub = hostname.slice(0, hostname.length - baseDomain.length - 1);
        return sub === 'www' ? null : sub;
    }

    // 5. Localhost subdomain testing  (admit.localhost → 'admit')
    if (hostname.endsWith('.localhost')) {
        const parts = hostname.split('.');
        const sub = parts[0];
        return sub === 'www' ? null : sub;
    }

    // 6. Fully custom domain (portal.hospitalA.com or hospitalA.com)
    //    Return the full hostname so SmartLogin renders HospitalLogin
    return hostname;
};
