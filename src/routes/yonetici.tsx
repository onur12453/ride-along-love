import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { PageHeader, RoleGate } from "@/components/Layout";
import { useStore, setState, STATUS_LABEL, type Volunteer, type Complaint } from "@/lib/store";

export const Route = createFileRoute("/yonetici")({
  head: () => ({
    meta: [
      { title: "Yönetici Paneli — Engelsiz Yol" },
      { name: "description", content: "Talepleri, gönüllü başvurularını ve şikâyetleri yönetin." },
      { property: "og:title", content: "Yönetici Paneli — Engelsiz Yol" },
      { property: "og:description", content: "Platform denetimi ve gönüllü doğrulama." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Yönetici Paneli" subtitle="Talepleri, gönüllüleri ve şikâyetleri denetleyin." icon={<ShieldCheck className="size-10" aria-hidden />} />
      <RoleGate need="yonetici"><Admin /></RoleGate>
    </>
  ),
});

const TABS = ["Talepler", "Gönüllü başvuruları", "Şikâyetler", "Tamamlananlar"] as const;

function Admin() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Talepler");
  const { requests, volunteers, complaints } = useStore((s) => ({ requests: s.requests, volunteers: s.volunteers, complaints: s.complaints }));
  const updV = (id: string, p: Partial<Volunteer>) => setState((s) => ({ volunteers: s.volunteers.map((v) => (v.id === id ? { ...v, ...p } : v)) }));
  const updC = (id: string, p: Partial<Complaint>) => setState((s) => ({ complaints: s.complaints.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const vName = (id?: string) => volunteers.find((v) => v.id === id)?.name ?? "—";

  const stats = [
    ["Toplam talep", requests.length],
    ["Açık talep", requests.filter((r) => r.status === "olusturuldu").length],
    ["Bekleyen başvuru", volunteers.filter((v) => v.status === "beklemede").length],
    ["Açık şikâyet", complaints.filter((c) => c.status !== "cozuldu").length],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(([l, n]) => <div key={l} className="card p-5"><p className="text-3xl font-bold">{n}</p><p className="text-muted-foreground">{l}</p></div>)}
      </div>
      <div role="tablist" aria-label="Yönetici bölümleri" className="flex flex-wrap gap-2">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`btn !min-h-10 !py-2 ${tab === t ? "btn-primary" : "btn-outline"}`}>{t}</button>)}
      </div>

      <div role="tabpanel" className="card p-4 md:p-6 overflow-x-auto">
        {(tab === "Talepler" || tab === "Tamamlananlar") && (
          <table className="w-full text-left">
            <caption className="sr-only">{tab}</caption>
            <thead><tr className="border-b"><th className="p-2">No</th><th className="p-2">Yolcu</th><th className="p-2">Güzergâh (ilçe)</th><th className="p-2">Tarih</th><th className="p-2">Gönüllü</th><th className="p-2">Durum</th><th className="p-2">İşlem</th></tr></thead>
            <tbody>
              {requests.filter((r) => tab === "Talepler" || r.status === "tamamlandi").map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-2 font-bold">{r.id}</td><td className="p-2">{r.passenger}</td><td className="p-2">{r.fromDistrict} → {r.toDistrict}</td>
                  <td className="p-2">{r.date} {r.time}</td><td className="p-2">{vName(r.volunteerId)}</td><td className="p-2">{STATUS_LABEL[r.status]}</td>
                  <td className="p-2"><button className="text-destructive font-bold underline" onClick={() => { setState((s) => ({ requests: s.requests.filter((x) => x.id !== r.id) })); toast("Talep kaldırıldı."); }}>Kaldır</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Gönüllü başvuruları" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((v) => (
              <article key={v.id} className="rounded-2xl border p-4 grid gap-2">
                <h3 className="font-bold text-lg">{v.name}</h3>
                <p>Durum: <b>{{ beklemede: "Beklemede", onayli: "Onaylı", reddedildi: "Reddedildi" }[v.status]}</b></p>
                <p className="text-sm text-muted-foreground">Bölgeler: {v.regions.join(", ") || "—"} · Araç: {v.wheelchairCar ? "Tekerlekli sandalye uyumlu" : "Standart"}</p>
                {([["idChecked", "Kimlik"], ["licenseChecked", "Ehliyet/ruhsat"], ["recordChecked", "Adli sicil"]] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2"><input type="checkbox" className="size-5 accent-primary" checked={v[k]} onChange={(e) => updV(v.id, { [k]: e.target.checked })} />{l} doğrulandı</label>
                ))}
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-accent flex-1 !min-h-10 !py-2" disabled={!(v.idChecked && v.licenseChecked && v.recordChecked)} onClick={() => { updV(v.id, { status: "onayli" }); toast.success("Gönüllü onaylandı."); }}>Onayla</button>
                  <button className="btn btn-danger flex-1 !min-h-10 !py-2" onClick={() => updV(v.id, { status: "reddedildi" })}>Reddet</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === "Şikâyetler" && (
          <div className="grid gap-3">
            {complaints.length === 0 && <p>Kayıt yok.</p>}
            {complaints.map((c) => (
              <article key={c.id} className="rounded-2xl border p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold">{c.type === "sikayet" ? "Şikâyet" : "Geri bildirim"}: {c.subject} <span className="text-sm text-muted-foreground">({c.date})</span></p>
                  <p>{c.message}</p>
                </div>
                <label className="sr-only" htmlFor={`st-${c.id}`}>Durum</label>
                <select id={`st-${c.id}`} className="field !w-auto" value={c.status} onChange={(e) => updC(c.id, { status: e.target.value as Complaint["status"] })}>
                  <option value="acik">Açık</option><option value="inceleniyor">İnceleniyor</option><option value="cozuldu">Çözüldü</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">Gizlilik: Yönetici panelinde açık adres ve telefon numaraları gösterilmez; yalnızca ilçe bilgisi görünür.</p>
    </div>
  );
}
