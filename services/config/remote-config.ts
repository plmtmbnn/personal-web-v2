import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getRemoteConfig, 
  fetchAndActivate, 
  getValue, 
  RemoteConfig 
} from "firebase/remote-config";
import { ENV_GLOBAL } from "@/lib/core/env";
import { RemoteConfigSchema, DefaultConfig } from "./types";

/**
 * Service for managing application configuration via Firebase Remote Config.
 * Implements local fallback and type-safe access.
 */
class RemoteConfigService {
  private remoteConfig: RemoteConfig | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    // Remote Config only works in the browser
    if (typeof window === "undefined") return;

    try {
      const firebaseConfig = {
        apiKey: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: ENV_GLOBAL.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      // Prevent re-initialization
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      this.remoteConfig = getRemoteConfig(app);
      
      // Configuration
      this.remoteConfig.settings.fetchTimeoutMillis = 10000; // 10s
      this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
      
      // Initial values from DefaultConfig
      this.remoteConfig.defaultConfig = DefaultConfig as any;
      
      this.initialized = true;
    } catch (error) {
      console.error("[RemoteConfig] Initialization failed:", error);
    }
  }

  /**
   * Fetches latest values from cloud and returns a specific config value.
   * Gracefully falls back to local DefaultConfig if offline or error.
   */
  async getConfigValue<K extends keyof RemoteConfigSchema>(key: K): Promise<RemoteConfigSchema[K]> {
    if (!this.initialized || !this.remoteConfig) {
      // console.log(`[RemoteConfig] Using Fallback for "${key}":`, DefaultConfig[key]);
      return DefaultConfig[key];
    }

    try {
      await fetchAndActivate(this.remoteConfig);
      const val = getValue(this.remoteConfig, key);
      
      // Extract based on expected type
      const defaultValue = DefaultConfig[key];
      let result: any;

      if (typeof defaultValue === "boolean") {
        result = val.asBoolean();
      } else if (typeof defaultValue === "number") {
        result = val.asNumber();
      } else {
        result = val.asString();
      }

      console.log(`[RemoteConfig] Cloud Value for "${key}":`, result);
      return result;
    } catch (error) {
      console.warn(`[RemoteConfig] Fetch failed for "${key}". Using Fallback.`);
      return DefaultConfig[key];
    }
  }
}

export const remoteConfigService = new RemoteConfigService();
