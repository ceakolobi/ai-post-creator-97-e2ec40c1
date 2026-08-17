import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { REDES, proximoHorarioPadrao } from "@/lib/agenda";

export function AgendarDialog({ postId }: { postId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [rede, setRede] = useState<string>("instagram");
  const [quando, setQuando] = useState(proximoHorarioPadrao());
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!user) return;
    if (!quando) {
      toast.error("Escolha a data e a hora do lembrete.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from("agendamentos").insert({
      user_id: user.id,
      post_id: postId,
      rede,
      agendado_para: new Date(quando).toISOString(),
      observacao: observacao.trim() || null,
    });
    setSalvando(false);
    if (error) {
      toast.error("Não conseguimos criar o lembrete.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    setAberto(false);
    setObservacao("");
    toast.success("Lembrete criado! Ele aparece na sua Agenda.");
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarClock />
          Agendar lembrete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar publicação</DialogTitle>
          <DialogDescription>
            Escolha quando quer publicar. Na hora marcada o post aparece na Agenda com a imagem e a legenda
            prontas para copiar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rede social</Label>
            <Select value={rede} onValueChange={setRede}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REDES.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quando">Data e hora</Label>
            <Input id="quando" type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obs">Observação (opcional)</Label>
            <Textarea
              id="obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: marcar o parceiro, usar nos stories também"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button variant="hero" onClick={salvar} disabled={salvando}>
            {salvando && <Loader2 className="animate-spin" />}
            Salvar lembrete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
