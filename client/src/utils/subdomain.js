export const getSubdomain = () => {
    // 1. Check if slug is passed as a query parameter (for environments where subdomains are not supported, e.g. vercel.app)
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('slug');
    if (querySlug) {
        return querySlug;
    }

    const hostname = window.location.hostname;

    // Direct IPs or naked localhost
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === 'localhost') {
        return null;
    }

    let baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'medicalhms.in';

    // Automatically detect Vercel app domains
    if (hostname.endsWith('.vercel.app') && !import.meta.env.VITE_BASE_DOMAIN) {
        const parts = hostname.split('.');
        if (parts.length === 3) {
            // E.g. project-name.vercel.app
            baseDomain = hostname;
        } else if (parts.length > 3) {
            // E.g. subdomain.project-name.vercel.app
            baseDomain = parts.slice(-3).join('.');
        }
    }

    const isBaseDomain = hostname === baseDomain || hostname === `www.${baseDomain}`;

    // If it's not the base domain and not localhost, it's either a subdomain of base domain OR a completely custom domain.
    if (!isBaseDomain) {
        const parts = hostname.split('.');

        // Localhost Subdomain testing (e.g., citycare.localhost)
        if (hostname.endsWith('localhost') && parts.length >= 2) {
            return parts[0] === 'www' ? null : parts[0];
        }

        // It is a live domain. If it's a subdomain of base domain:
        if (hostname.endsWith(`.${baseDomain}`)) {
            const subdomain = hostname.replace(`.${baseDomain}`, '');
            return subdomain === 'www' ? null : subdomain;
        }

        // Otherwise, it is a custom domain (like portal.hospitalA.com or hospitalA.com)
        // We can just return the full hostname or a special flag. Returning the hostname
        // ensures it is truthy and not in RESERVED_SUBDOMAINS, triggering HospitalLogin.
        return hostname;
    }

    return null;
};
