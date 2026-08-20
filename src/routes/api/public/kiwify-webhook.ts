import { createFileRoute } from "@tanstack/react-router";
import { processarWebhookKiwify } from "@/lib/kiwify.server";

/**
 * Alias legado do webhook da Kiwify.
 * URL: https://<seu-dominio>/api/public/kiwify-webhook
 * Preferencial: /api/webhooks/kiwify
 */
export const Route = createFileRoute("/api/public/kiwify-webhook")({
  server: {
    handlers: {
      POST: ({ request }) => processarWebhookKiwify(request),
    },
  },
});
