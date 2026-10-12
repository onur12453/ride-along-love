import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Menu, Phone, X, Type, Contrast, Accessibility, LifeBuoy } from "lucide-react";
import { useStore, setState, type Role, resetDemo } from "@/lib/store";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/talep", label: "Ulaşım İste" },
  { to: "/takip", label: "Yolculuk Takibi" },
  { to: "/gonullu", label: "Gönüllü Paneli" },
  { to: "/yonetici", label: "Yönetici" },
  { to: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { to: "/sss", label: "SSS" },
  { to: "/geri-bildirim", label: "Geri Bildirim" },
] as const;

const ROLES: { v: Role; l: string }[] = [
  { v: "yolcu", l: "Yolcu" },
  { v: "gonullu", l: "Gönüllü" },
  { v: "yonetici", l: "Yönetici" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sos, setSos] = useState(false);
  const role = useStore((s) => s.role);
  const fontScale = useStore((s) => s.fontScale);
  const contrast = useStore((s) => s.contrast);

  useEffect(() => {
    document.documentElement.style.setProperty("--base-size", `${18 * fontScale}px`);
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [fontScale, contrast]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-card">
        İçeriğe atla
      </a>
      <div role="alert" className="bg-warning text-warning-foreground text-sm px-4 py-2 text-center font-semibold">
        <AlertTriangle className="inline size-4 mr-1" aria-hidden />
        DEMO: Bu bir okul projesi prototipidir. Gerçek ulaşım hizmeti henüz aktif değildir; veriler örnektir ve yalnızca bu tarayıcıda saklanır.
      </div>

      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary whitespace-nowrap" aria-label="Engelsiz Yol ana sayfa">
            <span className="grid place-items-center size-10 rounded-xl bg-hero text-primary-foreground">
              <Accessibility aria-hidden />
            </span>
            Engelsiz Yol
          </Link>
          <nav aria-label="Ana menü" className="hidden xl:flex gap-0.5 ml-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="px-2.5 py-2 rounded-lg font-semibold text-base whitespace-nowrap hover:bg-secondary" activeProps={{ className: "bg-secondary text-primary" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="rol">Demo rolü seçin</label>
            <select id="rol" value={role} onChange={(e) => { setState(() => ({ role: e.target.value as Role })); toast.success(`Demo rolü: ${ROLES.find(r=>r.v===e.target.value)?.l}`); }} className="field !min-h-10 !py-1 !w-auto font-semibold">
              {ROLES.map((r) => <option key={r.v} value={r.v}>Rol: {r.l}</option>)}
            </select>
            <button className="xl:hidden btn btn-outline !p-2 !min-h-10" aria-expanded={open} aria-label="Menüyü aç" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobil menü" className="xl:hidden border-t px-4 py-3 grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg font-semibold bg-muted">{n.label}</Link>
            ))}
          </nav>
        )}
        <div className="border-t bg-muted/60">
          <div className="mx-auto max-w-7xl px-4 py-1.5 flex flex-wrap items-center gap-2 text-sm" role="toolbar" aria-label="Erişilebilirlik ayarları">
            <Type className="size-4" aria-hidden /> <span className="font-semibold">Yazı boyutu:</span>
            {[1, 1.15, 1.3].map((v, i) => (
              <button key={v} aria-pressed={fontScale === v} onClick={() => setState(() => ({ fontScale: v }))}
                className={`px-3 py-1 rounded-md font-bold border ${fontScale === v ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                {["A", "A+", "A++"][i]}
              </button>
            ))}
            <button aria-pressed={contrast} onClick={() => setState((s) => ({ contrast: !s.contrast }))}
              className={`ml-2 px-3 py-1 rounded-md font-bold border inline-flex items-center gap-1 ${contrast ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <Contrast className="size-4" aria-hidden /> Yüksek kontrast
            </button>
          </div>
        </div>
      </header>

      <main id="icerik" className="flex-1">{children}</main>

      <button onClick={() => setSos(true)} className="fixed bottom-5 right-5 z-50 btn btn-danger shadow-soft rounded-full !px-5" aria-label="Acil durum ve destek">
        <LifeBuoy aria-hidden /> Acil / Destek
      </button>
      {sos && (
        <div role="dialog" aria-modal="true" aria-labelledby="sos-t" className="fixed inset-0 z-50 bg-foreground/50 grid place-items-center p-4" onClick={() => setSos(false)}>
          <div className="card p-6 max-w-md w-full fade-up" onClick={(e) => e.stopPropagation()}>
            <h2 id="sos-t" className="text-2xl font-bold mb-2">Acil Durum ve Destek</h2>
            <p className="text-muted-foreground mb-4">Hayati tehlike varsa hemen 112'yi arayın. Diğer konular için destek ekibimize ulaşabilirsiniz (demo).</p>
            <div className="grid gap-3">
              <a href="tel:112" className="btn btn-danger text-lg"><Phone aria-hidden /> 112 Acil Çağrı</a>
              <button className="btn btn-primary" onClick={() => { toast.success("Destek ekibine bildirim gönderildi (demo)."); setSos(false); }}>Destek ekibine konumumu bildir (demo)</button>
              <Link to="/geri-bildirim" className="btn btn-outline" onClick={() => setSos(false)}>Şikâyet / Geri bildirim</Link>
              <button className="btn" onClick={() => setSos(false)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <p className="font-display font-bold text-xl">Engelsiz Yol</p>
            <p className="opacity-80 mt-2">Ücretsiz erişilebilir ulaşım için toplumsal dayanışma. Sosyal bilgiler dersi projesi.</p>
          </div>
          <div className="opacity-90">
            <p className="font-bold mb-2">Gizlilik</p>
            <p className="text-sm">Açık adres ve iletişim bilgileri herkese açık gösterilmez; yalnızca karşılıklı onaydan sonra eşleşen kişiler arasında paylaşılır.</p>
          </div>
          <div>
            <button className="btn btn-accent" onClick={() => { resetDemo(); toast("Demo verileri sıfırlandı."); }}>Demo verilerini sıfırla</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <section className="bg-hero text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 fade-up">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-3xl md:text-5xl font-bold">{title}</h1>
        </div>
        {subtitle && <p className="mt-3 text-lg md:text-xl opacity-90 max-w-3xl">{subtitle}</p>}
      </div>
    </section>
  );
}

export function FreeBadge({ text = "Tüm yolculuklar tamamen ÜCRETSİZDİR." }: { text?: string }) {
  return (
    <div role="note" className="rounded-2xl border-2 border-success bg-success/10 p-4 font-bold text-lg flex items-center gap-2">
      <span aria-hidden className="text-2xl">💚</span> {text}
    </div>
  );
}

export function RoleGate({ need, children }: { need: Role; children: ReactNode }) {
  const role = useStore((s) => s.role);
  if (role !== need) {
    const l = { yolcu: "Yolcu", gonullu: "Gönüllü", yonetici: "Yönetici" }[need];
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold">Bu sayfa için yetki gerekli</h2>
          <p className="mt-2 text-muted-foreground">Bu bölüm yalnızca <b>{l}</b> rolündeki kullanıcılar içindir. Gerçek sistemde güvenli giriş ve sunucu taraflı yetki kontrolü yapılır.</p>
          <button className="btn btn-primary mt-6" onClick={() => setState(() => ({ role: need }))}>Demo olarak {l} rolüne geç</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
