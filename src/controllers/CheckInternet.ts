type InternetStatus = {
    online: boolean;
    latency?: number;
};

export async function checkInternet(timeoutMs: number = 3000): Promise<InternetStatus> {
    if (!navigator.onLine) {
        return { online: false };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const start = performance.now();

    try {
        await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            cache: "no-store",
            signal: controller.signal
        });

        const latency = performance.now() - start;

        return { online: true, latency };
    } catch {
        return { online: false };
    } finally {
        clearTimeout(timeout);
    }
}