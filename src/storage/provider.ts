import { CloudinaryProvider } from "./cloudinary";
import type { BaseProvider } from "./base.storage";

type ProviderFactory = () => BaseProvider;

const REGISTRY: Record<string, ProviderFactory> = {
  cloudinary: () => new CloudinaryProvider(),
};

// Cache the active provider instance
let _instance: BaseProvider | null = null;

/**
 * Returns the provider configured in UPLOAD_PROVIDER env var.
 * Pass a name to override (useful in tests or per-request switching).
 */
export function getProvider(name?: string): BaseProvider {
  const key = name || process.env.UPLOAD_PROVIDER || "cloudinary";
  const factory = REGISTRY[key];
  if (!factory) {
    throw new Error(
      `Unknown provider "${key}". Available: ${Object.keys(REGISTRY).join(", ")}`,
    );
  }

  if (!name) {
    // Cache the default provider
    _instance = _instance || factory();
    return _instance;
  }
  return factory();
}

/** Register a custom provider at runtime */
export function registerProvider(name: string, factory: ProviderFactory): void {
  if (typeof factory !== "function")
    throw new Error("factory must be a function returning a provider instance");
  REGISTRY[name] = factory;
}
