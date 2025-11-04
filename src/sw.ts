import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, BackgroundSyncPlugin } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  disableDevLogs: true,
});

const mutationsQueue = new BackgroundSyncPlugin("mutations-queue", {
  maxRetentionTime: 24 * 60,
});

const isApiMutation = ({ request }: { url: URL; request: Request }) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

const mutationHandler = new NetworkOnly({ plugins: [mutationsQueue] });
serwist.registerCapture(isApiMutation, mutationHandler, "POST");
serwist.registerCapture(isApiMutation, mutationHandler, "PUT");
serwist.registerCapture(isApiMutation, mutationHandler, "PATCH");
serwist.registerCapture(isApiMutation, mutationHandler, "DELETE");
serwist.addEventListeners();
