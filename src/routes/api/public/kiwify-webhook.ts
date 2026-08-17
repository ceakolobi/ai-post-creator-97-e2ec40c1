import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Webhook da Kiwify.
 * URL: https://<seu-dominio>/api/public/kiwify-webhook
 * Segredo: KIWIFY_WEBHOOK_TOKEN (o "token" do webhook copiado no painel da Kiwify).
 * A Kiwify assina o corpo com HMAC-SHA1 e envia em ?signature=...
 */

type KiwifyPayload = {
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  Product?: { product_id?: string; product_name?: string };
  Customer?: { email?: string; full_name?: string };
  Commissions?: { charge_amount?: number };
  subscription_id?: string;
};

const STATUS_ATIVO = new Set(["paid", "approved", "authorized"]);
const STATUS_INATIVO = new Set([
  "refunded",
  "chargedback",
  "chargeback",
  "canceled",
  "cancelled",
  "subscription_canceled",
  "subscription_late",
  "expired",
]);

function assinaturaValida(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const esperado = createHmac("sha1", secret).update(body).digest("hex");
  const a = Buffer.from(signature.toLowerCase());
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/kiwify-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["KIWIFY_WEBHOOK_TOKEN"];
        if (!secret) {
          return new Response("Webhook não configurado", { status: 503 });
        }

        const body = await request.text();
        const url = new URL(request.url);
        const signature =
          url.searchParams.get("signature") ?? request.headers.get("x-kiwify-signature");

        if (!assinaturaValida(body, signature, secret)) {
          return new Response("Assinatura inválida", { status: 401 });
        }

        let payload: KiwifyPayload;
        try {
          payload = JSON.parse(body) as KiwifyPayload;
        } catch {
          return new Response("JSON inválido", { status: 400 });
        }

        const email = payload.Customer?.email?.trim().toLowerCase();
        if (!email) return new Response("Sem e-mail do comprador", { status: 400 });

        const status = (payload.order_status ?? payload.webhook_event_type ?? "").toLowerCase();
        const ativar = STATUS_ATIVO.has(status);
        const desativar = STATUS_INATIVO.has(status);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Descobre o plano pelo produto da Kiwify
        const { data: mapeamento } = await supabaseAdmin
          .from("plan_checkouts")
          .select("plano_id, produto_id");
        const planoId =
          mapeamento?.find((m) => m.produto_id && m.produto_id === payload.Product?.product_id)
            ?.plano_id ?? null;

        // Casa o pagamento com a conta pelo e-mail
        const { data: perfil } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .ilike("email", email)
          .maybeSingle();

        await supabaseAdmin.from("pagamentos").insert({
          user_id: perfil?.id ?? null,
          email,
          plano_id: planoId,
          status,
          evento: payload.webhook_event_type ?? null,
          order_id: payload.order_id ?? null,
          valor: payload.Commissions?.charge_amount ?? null,
          payload: payload as never,
        });

        if (perfil?.id && (ativar || desativar)) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: ativar ? "ativo" : "cancelado",
              plano_ativo: ativar ? planoId : null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", perfil.id);
        }

        return Response.json({ ok: true, matched: !!perfil?.id, plano: planoId });
      },
    },
  },
});
