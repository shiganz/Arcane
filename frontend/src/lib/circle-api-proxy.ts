const CIRCLE_API_ORIGIN = "https://api.circle.com";
const PROXY_PREFIX = "/api/circle";

/**
 * Routes Circle Stablecoin Service requests through Next.js to avoid browser CORS.
 */
export function installCircleApiProxy(): void {
  if (typeof window === "undefined") return;

  const globalScope = window as Window & { __circleApiProxyInstalled?: boolean };
  if (globalScope.__circleApiProxyInstalled) return;
  globalScope.__circleApiProxyInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.startsWith(CIRCLE_API_ORIGIN)) {
      const proxiedUrl = url.replace(CIRCLE_API_ORIGIN, PROXY_PREFIX);
      if (typeof input === "string" || input instanceof URL) {
        return originalFetch(proxiedUrl, init);
      }
      return originalFetch(new Request(proxiedUrl, input), init);
    }

    return originalFetch(input, init);
  };
}
