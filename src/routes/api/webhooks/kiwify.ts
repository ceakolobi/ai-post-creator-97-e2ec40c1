import { createFileRoute } from "@tanstack/react-router";
import { processarWebhookKiwify } from "@/lib/kiwify.server";

/**
 * Webhook da Kiwify (URL de produção):
 * https://hagoth.antum.com.br/api/webhooks/kiwify
 */
export const Route = createFileRoute("/api/webhooks/kiwify")({
  server: {
    handlers: {
      POST: ({ request }) => processarWebhookKiwify(request),
    },
  },
});
