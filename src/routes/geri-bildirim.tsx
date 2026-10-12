import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/Layout";
import { setState, uid, type Complaint } from "@/lib/store";

export const Route = createFileRoute("/geri-bildirim")({
  head: () => ({
    meta: [
      { title: "Şikâyet ve Geri Bildirim — Engelsiz Yol" },
      { name: "description", content: "Yolculuklarınızla ilgili şikâyet veya geri bildirim gönderin." },
      { property: "og:title", content: "Şikâyet ve Geri Bildirim — Engelsiz Yol" },
      { property: "og:description", content: "Güvenliğiniz ve memnuniyetiniz bizim için önemli." },
    ],
  }),
  component: Page,
});

const schema = z.object({ subject: z.string().trim().min(3, "Konu en az 3 karakter olmalı").max(100), message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı").max(1000) });

function Page() {
  const [type, setType] = useState<Complaint["type"]>("geri_bildirim");
  const [subject, setS] = useState("");
  const [message, setM] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ subject, message });
    if (!r.success) return setErr(r.error.issues[0]?.message ?? "Hata");
    setErr("");
    setState((s) => ({ complaints: [{ id: uid("S"), type, ...r.data, status: "acik", date: new Date().toISOString().slice(0, 10) }, ...s.complaints] }));
    setS(""); setM("");
    toast.success("Mesajınız iletildi. Teşekkür ederiz.");
  };
  return (
    <>
      <PageHeader title="Şikâyet ve Geri Bildirim" subtitle="Güvenliğiniz ve onurunuz önceliğimizdir. Her bildirim yöneticiler tarafından incelenir." icon={<MessageSquare className="size-10" aria-hidden />} />
      <form onSubmit={submit} className="mx-auto max-w-2xl px-4 py-10 grid gap-5">
        <div className="card p-6 grid gap-5">
          <fieldset><legend className="font-bold text-lg mb-2">Bildirim türü</legend>
            <div className="flex gap-3">
              {([["geri_bildirim", "Geri bildirim"], ["sikayet", "Şikâyet"]] as const).map(([v, l]) => (
                <label key={v} className={`btn flex-1 border-2 cursor-pointer ${type === v ? "btn-primary" : "bg-card"}`}><input type="radio" className="sr-only" checked={type === v} onChange={() => setType(v)} />{l}</label>
              ))}
            </div>
          </fieldset>
          <div><label htmlFor="s" className="font-bold text-lg">Konu</label><input id="s" className="field mt-1" value={subject} onChange={(e) => setS(e.target.value)} maxLength={100} /></div>
          <div><label htmlFor="m" className="font-bold text-lg">Mesajınız</label><textarea id="m" rows={5} className="field mt-1" value={message} onChange={(e) => setM(e.target.value)} maxLength={1000} /></div>
          {err && <p role="alert" className="text-destructive font-bold">{err}</p>}
          <button className="btn btn-primary text-lg">Gönder</button>
        </div>
      </form>
    </>
  );
}
