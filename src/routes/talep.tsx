import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Accessibility } from "lucide-react";
import { PageHeader, FreeBadge } from "@/components/Layout";
import { DISTRICTS, setState, uid, type RideRequest } from "@/lib/store";

export const Route = createFileRoute("/talep")({
  head: () => ({
    meta: [
      { title: "Ücretsiz Ulaşım Talebi — Engelsiz Yol" },
      { name: "description", content: "Erişilebilir ve ücretsiz yolculuk için talep oluşturun." },
      { property: "og:title", content: "Ücretsiz Ulaşım Talebi — Engelsiz Yol" },
      { property: "og:description", content: "Gönüllü sürücüyle ücretsiz yolculuk talebi oluşturun." },
    ],
  }),
  component: Talep,
});

const schema = z.object({
  from: z.string().trim().min(3, "Alınacak adresi yazın").max(150),
  fromDistrict: z.string().min(1),
  to: z.string().trim().min(3, "Bırakılacak adresi yazın").max(150),
  toDistrict: z.string().min(1),
  date: z.string().min(1, "Tarih seçin"),
  time: z.string().min(1, "Saat seçin"),
  special: z.string().max(200),
  note: z.string().max(500),
});

function YesNo({ label, value, onChange, name }: { label: string; value: boolean; onChange: (v: boolean) => void; name: string }) {
  return (
    <fieldset>
      <legend className="font-bold text-lg mb-2">{label}</legend>
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <label key={String(v)} className={`btn flex-1 border-2 cursor-pointer ${value === v ? "btn-primary border-primary" : "bg-card"}`}>
            <input type="radio" name={name} className="sr-only" checked={value === v} onChange={() => onChange(v)} />
            {v ? "Evet" : "Hayır"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Talep() {
  const nav = useNavigate();
  const [f, setF] = useState({ from: "", fromDistrict: DISTRICTS[0], to: "", toDistrict: DISTRICTS[1], date: "", time: "", special: "", note: "" });
  const [wheelchair, setW] = useState(false);
  const [companion, setC] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const m: Record<string, string> = {};
      r.error.issues.forEach((i) => (m[String(i.path[0])] = i.message));
      setErr(m);
      toast.error("Lütfen eksik alanları doldurun.");
      return;
    }
    setErr({});
    const req: RideRequest = { id: uid("T"), passenger: "Siz (demo yolcu)", ...r.data, wheelchair, companion, status: "olusturuldu", passengerOk: false, volunteerOk: false, mine: true };
    setState((s) => ({ requests: [req, ...s.requests] }));
    toast.success("Talebiniz oluşturuldu!");
    nav({ to: "/takip", search: { id: req.id } });
  };

  const Err = ({ k }: { k: string }) => (err[k] ? <p role="alert" className="text-destructive font-semibold mt-1">{err[k]}</p> : null);

  return (
    <>
      <PageHeader title="Ücretsiz Ulaşım İste" subtitle="Bilgilerinizi doldurun, size uygun bir gönüllü sürücü bulalım." icon={<Accessibility className="size-10" aria-hidden />} />
      <div className="mx-auto max-w-3xl px-4 py-10 grid gap-6">
        <FreeBadge text="Bu hizmet tamamen ÜCRETSİZDİR. Hiçbir gönüllü sizden ücret talep edemez." />
        <form onSubmit={submit} noValidate className="card p-6 md:p-8 grid gap-6" aria-label="Ulaşım talep formu">
          <div className="grid md:grid-cols-[2fr_1fr] gap-4">
            <div><label htmlFor="from" className="font-bold text-lg">Nereden alınacak?</label><input id="from" className="field mt-1" value={f.from} onChange={up("from")} placeholder="Örn: Örnek Sokak No:1" aria-invalid={!!err.from} /><Err k="from" /></div>
            <div><label htmlFor="fd" className="font-bold text-lg">İlçe</label><select id="fd" className="field mt-1" value={f.fromDistrict} onChange={up("fromDistrict")}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div className="grid md:grid-cols-[2fr_1fr] gap-4">
            <div><label htmlFor="to" className="font-bold text-lg">Nereye bırakılacak?</label><input id="to" className="field mt-1" value={f.to} onChange={up("to")} placeholder="Örn: Örnek Hastanesi" aria-invalid={!!err.to} /><Err k="to" /></div>
            <div><label htmlFor="td" className="font-bold text-lg">İlçe</label><select id="td" className="field mt-1" value={f.toDistrict} onChange={up("toDistrict")}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          </div>
          <p className="text-muted-foreground -mt-3">🔒 Açık adresiniz herkese gösterilmez; yalnızca karşılıklı onaydan sonra eşleşen gönüllüyle paylaşılır.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="date" className="font-bold text-lg">Yolculuk tarihi</label><input id="date" type="date" className="field mt-1" value={f.date} onChange={up("date")} /><Err k="date" /></div>
            <div><label htmlFor="time" className="font-bold text-lg">Saat</label><input id="time" type="time" className="field mt-1" value={f.time} onChange={up("time")} /><Err k="time" /></div>
          </div>
          <YesNo name="wc" label="Tekerlekli sandalye erişimi gerekiyor mu?" value={wheelchair} onChange={setW} />
          <div><label htmlFor="sp" className="font-bold text-lg">Araçta özel bir erişilebilirlik ihtiyacı var mı?</label><input id="sp" className="field mt-1" value={f.special} onChange={up("special")} placeholder="Örn: Rampa, rehber köpek, alçak basamak" /></div>
          <YesNo name="cp" label="Refakatçi ile seyahat edilecek mi?" value={companion} onChange={setC} />
          <div><label htmlFor="note" className="font-bold text-lg">Ek açıklama <span className="font-normal text-muted-foreground">(isteğe bağlı)</span></label><textarea id="note" rows={3} className="field mt-1" value={f.note} onChange={up("note")} maxLength={500} /></div>
          <button type="submit" className="btn btn-primary text-xl !py-5">Ulaşım Talebi Oluştur</button>
        </form>
      </div>
    </>
  );
}
