import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Check, MapPin, Flag, Car, Users, Accessibility } from "lucide-react";
import { PageHeader } from "@/components/Layout";
import { useStore, setState, STATUS_LABEL, STATUS_ORDER, maskAddress, type RideRequest } from "@/lib/store";

export const Route = createFileRoute("/takip")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Yolculuk Takibi — Engelsiz Yol" },
      { name: "description", content: "Ulaşım talebinizin durumunu adım adım takip edin." },
      { property: "og:title", content: "Yolculuk Takibi — Engelsiz Yol" },
      { property: "og:description", content: "Talep, eşleşme, onay ve tamamlanma durumları." },
    ],
  }),
  component: Takip,
});

export function DemoMap({ r }: { r: RideRequest }) {
  const pct = STATUS_ORDER.indexOf(r.status) / 3;
  return (
    <div className="relative rounded-2xl overflow-hidden bg-sky aspect-[16/10]" role="img" aria-label={`Demo harita: ${r.fromDistrict} ilçesinden ${r.toDistrict} ilçesine rota`}>
      <svg viewBox="0 0 400 250" className="absolute inset-0 size-full" aria-hidden>
        {[40, 90, 140, 190].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y + 10} className="stroke-card" strokeWidth="8" />)}
        {[60, 160, 260, 340].map((x) => <line key={x} y1="0" y2="250" x1={x} x2={x - 15} className="stroke-card" strokeWidth="8" />)}
        <path id="rota" d="M60 200 C 140 200, 160 80, 340 60" className="stroke-primary" strokeWidth="5" fill="none" strokeDasharray="10 6" />
        <circle cx="60" cy="200" r="12" className="fill-accent" />
        <circle cx="340" cy="60" r="12" className="fill-primary" />
        <circle r="9" className="fill-warning stroke-primary" strokeWidth="3" cx={60 + 280 * pct} cy={200 - 140 * pct} />
      </svg>
      <span className="absolute top-3 left-3 rounded-full bg-warning text-warning-foreground px-3 py-1 text-sm font-bold">DEMO HARİTA — gerçek harita bağlı değil</span>
      <span className="absolute bottom-3 left-3 rounded-lg bg-card px-3 py-1 font-semibold flex items-center gap-1"><MapPin className="size-4 text-accent" aria-hidden />{r.fromDistrict}</span>
      <span className="absolute top-12 right-3 rounded-lg bg-card px-3 py-1 font-semibold flex items-center gap-1"><Flag className="size-4 text-primary" aria-hidden />{r.toDistrict}</span>
    </div>
  );
}

export function Steps({ status }: { status: RideRequest["status"] }) {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <ol className="grid sm:grid-cols-4 gap-3" aria-label="Yolculuk durumu">
      {STATUS_ORDER.map((s, i) => (
        <li key={s} aria-current={i === idx ? "step" : undefined} className={`rounded-2xl p-4 border-2 flex items-center gap-3 ${i <= idx ? "border-success bg-success/10" : "border-border bg-card"}`}>
          <span className={`grid place-items-center size-10 shrink-0 rounded-full font-bold ${i <= idx ? "bg-success text-success-foreground" : "bg-muted"}`}>{i < idx || status === "tamamlandi" ? <Check aria-hidden /> : i + 1}</span>
          <span className="font-bold">{STATUS_LABEL[s]}{i <= idx && <span className="sr-only"> (tamamlandı)</span>}</span>
        </li>
      ))}
    </ol>
  );
}

function Takip() {
  const { id } = Route.useSearch();
  const requests = useStore((s) => s.requests);
  const volunteers = useStore((s) => s.volunteers);
  const mine = requests.filter((r) => r.mine);
  const r = requests.find((x) => x.id === id) ?? mine[0];

  if (!r) {
    return (
      <>
        <PageHeader title="Yolculuk Takibi" />
        <div className="mx-auto max-w-xl px-4 py-16 text-center card p-8 mt-10">
          <p className="text-xl">Henüz bir talebiniz yok.</p>
          <Link to="/talep" className="btn btn-primary mt-6">Ücretsiz Ulaşım İste</Link>
        </div>
      </>
    );
  }
  const vol = volunteers.find((v) => v.id === r.volunteerId);
  const confirmPassenger = () => {
    setState((s) => ({ requests: s.requests.map((x) => {
      if (x.id !== r.id) return x;
      const n = { ...x, passengerOk: true };
      if (n.volunteerOk) n.status = "onaylandi";
      return n;
    }) }));
    toast.success("Onayınız kaydedildi.");
  };

  return (
    <>
      <PageHeader title="Yolculuk Takibi" subtitle={`Talep no: ${r.id}`} />
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6">
        {mine.length > 1 && (
          <div className="flex flex-wrap gap-2" aria-label="Taleplerim">
            {mine.map((m) => <Link key={m.id} to="/takip" search={{ id: m.id }} className={`btn !min-h-10 !py-2 ${m.id === r.id ? "btn-primary" : "btn-outline"}`}>{m.id}</Link>)}
          </div>
        )}
        <Steps status={r.status} />
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          <DemoMap r={r} />
          <div className="card p-6 grid gap-3 content-start">
            <h2 className="text-2xl font-bold">Yolculuk bilgileri</h2>
            <p><b>Başlangıç:</b> {maskAddress(r, "from")}</p>
            <p><b>Varış:</b> {maskAddress(r, "to")}</p>
            <p><b>Tarih:</b> {r.date} · {r.time}</p>
            <p className="flex flex-wrap gap-2">
              {r.wheelchair && <span className="rounded-full bg-sky px-3 py-1 font-semibold inline-flex items-center gap-1"><Accessibility className="size-4" aria-hidden />Tekerlekli sandalye</span>}
              {r.companion && <span className="rounded-full bg-sky px-3 py-1 font-semibold inline-flex items-center gap-1"><Users className="size-4" aria-hidden />Refakatçili</span>}
              {r.special && <span className="rounded-full bg-sky px-3 py-1 font-semibold">{r.special}</span>}
            </p>
            <p className="flex items-center gap-2"><Car aria-hidden /><b>Gönüllü:</b> {vol ? `${vol.name} ✔ doğrulanmış` : "Aranıyor…"}</p>
            <p className="font-bold text-success">Ücret: 0 ₺ (ücretsiz)</p>
            {r.status === "gonullu_bulundu" && (
              <div className="rounded-2xl bg-secondary p-4">
                <p className="font-bold">Karşılıklı onay</p>
                <p>Yolcu: {r.passengerOk ? "✔ Onayladı" : "Bekleniyor"} · Gönüllü: {r.volunteerOk ? "✔ Onayladı" : "Bekleniyor"}</p>
                {!r.passengerOk && <Button variant="legacy" size="legacy" className="btn btn-primary mt-3 w-full" onClick={confirmPassenger}>Yolculuğu onaylıyorum</Button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
