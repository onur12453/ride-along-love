import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { HeartHandshake, ShieldCheck, Check } from "lucide-react";
import { PageHeader, RoleGate } from "@/components/Layout";
import { useStore, setState, DAYS, DISTRICTS, STATUS_LABEL, maskAddress, type RideRequest } from "@/lib/store";

export const Route = createFileRoute("/gonullu")({
  head: () => ({
    meta: [
      { title: "Gönüllü Sürücü Paneli — Engelsiz Yol" },
      { name: "description", content: "Gönüllü sürücü olun, yakındaki ücretsiz ulaşım taleplerini üstlenin." },
      { property: "og:title", content: "Gönüllü Ol — Engelsiz Yol" },
      { property: "og:description", content: "Engelli bireylere ücretsiz ulaşım desteği verin." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Gönüllü Sürücü Paneli" subtitle="Zamanını ve aracını paylaş, birinin hayatına yol aç." icon={<HeartHandshake className="size-10" aria-hidden />} />
      <RoleGate need="gonullu"><Panel /></RoleGate>
    </>
  ),
});

function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`px-4 py-2 rounded-xl border-2 font-semibold ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
      {on && <Check className="inline size-4 mr-1" aria-hidden />}{label}
    </button>
  );
}

function RideCard({ r, children }: { r: RideRequest; children?: React.ReactNode }) {
  return (
    <article className="card p-5 grid gap-2">
      <div className="flex justify-between items-center gap-2"><h3 className="font-bold text-lg">{r.id}</h3><span className="rounded-full bg-sky px-3 py-1 text-sm font-bold">{STATUS_LABEL[r.status]}</span></div>
      <p><b>Nereden:</b> {maskAddress(r, "from")}</p>
      <p><b>Nereye:</b> {maskAddress(r, "to")}</p>
      <p><b>Zaman:</b> {r.date} · {r.time}</p>
      <p className="text-muted-foreground">{[r.wheelchair && "Tekerlekli sandalye", r.companion && "Refakatçi var", r.special].filter(Boolean).join(" · ") || "Özel ihtiyaç belirtilmedi"}</p>
      {children}
    </article>
  );
}

function Panel() {
  const meId = useStore((s) => s.meVolunteerId);
  const me = useStore((s) => s.volunteers.find((v) => v.id === s.meVolunteerId))!;
  const requests = useStore((s) => s.requests);
  const updMe = (p: Partial<typeof me>) => setState((s) => ({ volunteers: s.volunteers.map((v) => (v.id === meId ? { ...v, ...p } : v)) }));
  const toggle = (arr: string[], x: string) => (arr.includes(x) ? arr.filter((a) => a !== x) : [...arr, x]);
  const updReq = (id: string, fn: (r: RideRequest) => RideRequest) => setState((s) => ({ requests: s.requests.map((r) => (r.id === id ? fn(r) : r)) }));

  const open = requests.filter((r) => r.status === "olusturuldu").sort((a, b) => Number(me.regions.includes(b.fromDistrict)) - Number(me.regions.includes(a.fromDistrict)));
  const mine = requests.filter((r) => r.volunteerId === meId && r.status !== "tamamlandi");
  const done = requests.filter((r) => r.volunteerId === meId && r.status === "tamamlandi");
  const verified = me.idChecked && me.licenseChecked && me.recordChecked;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8">
      <div role="note" className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4 font-bold text-lg">
        ⚠️ Gönüllüler, engelli bireylerden hiçbir şekilde ücret, bahşiş veya hediye talep edemez. Bu kural ihlali hesabın kapatılmasına yol açar.
      </div>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-success" aria-hidden />Doğrulama durumu</h2>
          <ul className="mt-3 grid gap-2">
            {([["idChecked", "Kimlik doğrulama"], ["licenseChecked", "Ehliyet ve araç ruhsatı"], ["recordChecked", "Adli sicil kaydı"]] as const).map(([k, l]) => (
              <li key={k} className="flex justify-between"><span>{l}</span><span className={me[k] ? "text-success font-bold" : "text-muted-foreground"}>{me[k] ? "✔ Onaylı" : "Bekliyor"}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">Doğrulama yönetici tarafından yapılır. Doğrulanmamış gönüllüler talep üstlenemez.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Uygun olduğum günler</h2>
          <div className="mt-3 flex flex-wrap gap-2">{DAYS.map((d) => <Chip key={d} label={d} on={me.days.includes(d)} onClick={() => updMe({ days: toggle(me.days, d) })} />)}</div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Gidebileceğim bölgeler</h2>
          <div className="mt-3 flex flex-wrap gap-2">{DISTRICTS.map((d) => <Chip key={d} label={d} on={me.regions.includes(d)} onClick={() => updMe({ regions: toggle(me.regions, d) })} />)}</div>
          <label className="mt-5 flex items-center gap-3 font-bold text-lg cursor-pointer">
            <input type="checkbox" className="size-6 accent-primary" checked={me.wheelchairCar} onChange={(e) => updMe({ wheelchairCar: e.target.checked })} />
            Aracım tekerlekli sandalye erişimine uygun
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Yakındaki ulaşım talepleri ({open.length})</h2>
        {open.length === 0 && <p className="text-muted-foreground">Şu an açık talep yok.</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {open.map((r) => {
            const blocked = !verified || (r.wheelchair && !me.wheelchairCar);
            return (
              <RideCard key={r.id} r={r}>
                {me.regions.includes(r.fromDistrict) && <span className="text-success font-bold">📍 Bölgenizde</span>}
                <button disabled={blocked} className="btn btn-accent mt-2" onClick={() => { updReq(r.id, (x) => ({ ...x, status: "gonullu_bulundu", volunteerId: meId })); toast.success("Talebi üstlendiniz. Yolcunun onayı bekleniyor."); }}>
                  Bu talebi üstlen
                </button>
                {r.wheelchair && !me.wheelchairCar && <p className="text-sm text-destructive">Bu yolculuk tekerlekli sandalye uyumlu araç gerektirir.</p>}
              </RideCard>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Üstlendiğim yolculuklar ({mine.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mine.map((r) => (
            <RideCard key={r.id} r={r}>
              <p className="text-sm">Karşılıklı onay — Yolcu: {r.passengerOk ? "✔" : "bekleniyor"} · Siz: {r.volunteerOk ? "✔" : "bekleniyor"}</p>
              {!r.volunteerOk && <button className="btn btn-primary" onClick={() => updReq(r.id, (x) => ({ ...x, volunteerOk: true, status: x.passengerOk ? "onaylandi" : x.status }))}>Yolculuğu onayla</button>}
              {r.volunteerOk && !r.passengerOk && <button className="btn btn-outline" onClick={() => { updReq(r.id, (x) => ({ ...x, passengerOk: true, status: "onaylandi" })); toast("Demo: yolcu onayı simüle edildi."); }}>Demo: yolcu onayını simüle et</button>}
              {r.status === "onaylandi" && <button className="btn btn-accent" onClick={() => { updReq(r.id, (x) => ({ ...x, status: "tamamlandi" })); toast.success("Yolculuk tamamlandı. Teşekkürler! 💚"); }}>Tamamlandı olarak işaretle</button>}
              <button className="btn text-destructive" onClick={() => updReq(r.id, (x) => ({ ...x, status: "olusturuldu", volunteerId: undefined, volunteerOk: false, passengerOk: false }))}>Bırak</button>
            </RideCard>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Tamamladığım yolculuklar ({done.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{done.map((r) => <RideCard key={r.id} r={r} />)}</div>
      </section>
    </div>
  );
}
