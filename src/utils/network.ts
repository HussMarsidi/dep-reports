const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Checks connectivity to the npm registry with a short timeout.
 */
export async function checkRegistryConnectivity(
  registry: string = DEFAULT_REGISTRY,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${registry}/lodash`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
