import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Menu, Phone, X, Type, Contrast, Accessibility, LifeBuoy, Home, HeartHandshake, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useStore, setState, type Role, resetDemo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/talep", label: "Yardım Al" },
  { to: "/takip", label: "Yolculuklarım" },
  { to: "/gonullu", label: "Gönüllü Ol" },
  { to: "/yonetici", label: "Yönetici" },
  { to: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { to: "/sss", label: "SSS" },
  { to: "/geri-bildirim", label: "İletişim" },
] as const;
const ROLES: { v: Role; l: string }[] = [{ v: "yolcu", l: "Yolcu" }, { v: "gonullu", l: "Gönüllü" }, { v: "yonetici", l: "Yönetici" }];
const MOBILE = [
  { to: "/", label: "Ana Sayfa", icon: Home },
  { to: "/talep", label: "Yardım Al", icon: Accessibility },
  { to: "/takip", label: "Yolculuk", icon: MapPin },
  { to: "/gonullu", label: "Gönüllü", icon: HeartHandshake },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sos, setSos] = useState(false);
  const role = useStore((s) => s.role);
  const fontScale = useStore((s) => s.fontScale);
  const contrast = useStore((s) => s.contrast);
  const location = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sosRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.style.setProperty("--base-size", `${18 * fontScale}px`);
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [fontScale, contrast]);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!sos) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("a,button")?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSos(false);
      if (event.key !== "Tab" || !dialog) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>("a,button")];
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); document.body.style.overflow = previousOverflow; sosRef.current?.focus(); };
  }, [sos]);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-card">İçeriğe atla</a>
      <div role="alert" className="bg-warning text-warning-foreground text-xs px-4 py-2 text-center">
        <AlertTriangle className="inline size-3.5 mr-1" aria-hidden />
        <strong>Demo proje</strong> · Gerçek ulaşım hizmeti aktif değildir. Örnek veriler yalnızca bu tarayıcıda saklanır.
      </div>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-5 py-4 flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 font-display font-semibold text-xl whitespace-nowrap" aria-label="Engelsiz Yol ana sayfa">
            <span className="grid place-items-center size-10 rounded-full bg-primary text-primary-foreground"><Accessibility aria-hidden /></span>Engelsiz Yol<span className="text-primary hidden sm:inline" aria-hidden>✳</span>
          </Link>
          <nav aria-label="Ana menü" className="hidden xl:flex items-center gap-5 ml-auto">
            {NAV.filter((n) => ["/nasil-calisir", "/sss", "/takip", "/gonullu"].includes(n.to)).map((n) => <Link key={n.to} to={n.to} className="text-sm font-medium py-2 hover:underline underline-offset-4" activeProps={{ className: "underline" }}>{n.label}</Link>)}
          </nav>
          <div className="ml-auto xl:ml-0 flex items-center gap-2">
            <label className="sr-only" htmlFor="rol">Demo rolü seçin</label>
            <select id="rol" value={role} onChange={(e) => { setState(() => ({ role: e.target.value as Role })); toast.success(`Demo rolü: ${ROLES.find(r => r.v === e.target.value)?.l}`); }} className="field !min-h-10 !py-1 !px-2 !w-auto !text-xs !rounded-full">
              {ROLES.map((r) => <option key={r.v} value={r.v}>Demo: {r.l}</option>)}
            </select>
            <Link to="/talep" className="btn btn-primary !min-h-10 !py-2 !px-4 text-sm hidden lg:inline-flex">Yardım Al <ArrowUpRight className="size-4" aria-hidden /></Link>
            <Button variant="legacy" size="legacy" className="size-10 border bg-card" aria-expanded={open} aria-controls="tum-menu" aria-label={open ? "Menüyü kapat" : "Tüm menüyü aç"} onClick={() => setOpen(!open)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</Button>
          </div>
        </div>
        {open && <nav id="tum-menu" aria-label="Tüm sayfalar" className="border-t px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-7xl mx-auto">{NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>{n.label}</Link>)}</nav>}
        <div className="border-t">
          <div className="mx-auto max-w-7xl px-5 py-2 flex flex-wrap items-center gap-2 text-xs" role="toolbar" aria-label="Erişilebilirlik ayarları">
            <Type className="size-4" aria-hidden /><span className="hidden sm:inline text-muted-foreground">Yazı boyutu</span>
            {[1, 1.15, 1.3].map((v, i) => <Button variant="legacy" size="legacy" key={v} aria-label={`Yazı boyutu ${["normal", "büyük", "çok büyük"][i]}`} aria-pressed={fontScale === v} onClick={() => setState(() => ({ fontScale: v }))} className={`min-w-10 min-h-9 px-2 rounded-md ${fontScale === v ? "bg-foreground text-background" : "hover:bg-muted"}`}>{["A", "A+", "A++"][i]}</Button>)}
            <Button variant="legacy" size="legacy" aria-pressed={contrast} onClick={() => setState(s => ({ contrast: !s.contrast }))} className={`min-h-9 px-3 ml-1 ${contrast ? "bg-foreground text-background" : "hover:bg-muted"}`}><Contrast className="size-4" aria-hidden />Yüksek kontrast</Button>
            <Link to="/yonetici" className="ml-auto hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground"><ShieldCheck className="size-3.5" aria-hidden /> Yönetici</Link>
          </div>
        </div>
      </header>
      <main id="icerik" className="flex-1">{children}</main>
      <Button ref={sosRef} variant="legacy" size="legacy" onClick={() => setSos(true)} className="fixed bottom-20 sm:bottom-5 right-4 z-40 btn btn-danger shadow-soft !px-4 text-sm" aria-label="Acil durum ve destek"><LifeBuoy className="size-5" aria-hidden /><span className="hidden sm:inline">Acil / Destek</span><span className="sm:hidden">Acil</span></Button>
      {sos && <div className="fixed inset-0 z-50 bg-foreground/50 grid place-items-center p-4" onClick={() => setSos(false)}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="sos-t" aria-describedby="sos-d" className="card p-6 max-w-md w-full fade-up" onClick={e => e.stopPropagation()}>
          <span className="grid place-items-center size-12 rounded-full bg-destructive/10 text-destructive mb-4"><LifeBuoy aria-hidden /></span>
          <h2 id="sos-t" className="text-2xl font-medium mb-2">Acil Durum ve Destek</h2>
          <p id="sos-d" className="text-muted-foreground mb-5">Hayati tehlike varsa hemen 112'yi arayın. Destek bildirimi bu prototipte yalnızca demodur.</p>
          <div className="grid gap-3">
            <a href="tel:112" className="btn btn-danger"><Phone aria-hidden />112 Acil Çağrı</a>
            <Button variant="legacy" size="legacy" className="btn btn-primary" onClick={() => { toast("Demo: gerçek konum veya destek bildirimi gönderilmedi."); setSos(false); }}>Destek ekibine konumumu bildir (demo)</Button>
            <Link to="/geri-bildirim" className="btn btn-outline" onClick={() => setSos(false)}>Şikâyet / Geri bildirim</Link>
            <Button variant="legacy" size="legacy" className="btn" onClick={() => setSos(false)}>Kapat</Button>
          </div>
        </div>
      </div>}
      <footer className="site-footer mt-0">
        <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-[1.4fr_1fr_1fr] gap-8">
          <div><Link to="/" className="flex items-center gap-2 font-semibold text-xl"><Accessibility className="text-foreground" aria-hidden />Engelsiz Yol</Link><p className="text-sm text-muted-foreground mt-4 max-w-sm leading-relaxed">Birlikte daha özgür bir hayat. Ücretsiz erişilebilir ulaşım için toplumsal dayanışma.</p><p className="text-xs text-muted-foreground mt-4">Sosyal bilgiler dersi projesi · Demo</p></div>
          <div><p className="font-medium mb-4 text-sm">Birlikte yol alalım</p><div className="grid gap-3 text-sm text-muted-foreground"><Link to="/nasil-calisir">Nasıl çalışır?</Link><Link to="/gonullu">Gönüllü ol</Link><Link to="/sss">Sık sorulan sorular</Link><Link to="/geri-bildirim">İletişim ve geri bildirim</Link></div></div>
          <div><p className="font-medium mb-4 text-sm">Gizlilik ve güven</p><p className="text-sm text-muted-foreground leading-relaxed">Açık adres yalnızca karşılıklı onaydan sonra eşleşen kişiler arasında paylaşılır.</p><Button variant="legacy" size="legacy" className="text-xs underline underline-offset-4 mt-5 min-h-10" onClick={() => { resetDemo(); toast("Demo verileri sıfırlandı."); }}>Demo verilerini sıfırla</Button></div>
        </div>
        <div className="border-t max-w-7xl mx-auto px-6 py-5 text-xs text-muted-foreground">Engelsiz Yol · Herkes için erişilebilir bir gelecek.</div>
      </footer>
      <nav aria-label="Alt menü" className="mobile-nav sm:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-4">
        {MOBILE.map(n => <Link key={n.to} to={n.to} className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground" activeProps={{ className: "text-foreground bg-secondary/60" }} activeOptions={{ exact: true }}><n.icon className="size-5" aria-hidden />{n.label}</Link>)}
      </nav>
    </div>
  );
}
export function PageHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return <section className="page-heading"><div className="mx-auto max-w-7xl px-5 py-10 md:py-12 fade-up"><p className="section-kicker mb-4">Engelsiz Yol · Birlikte mümkün</p><div className="flex items-center gap-4">{icon && <span className="page-heading-icon shrink-0" aria-hidden>{icon}</span>}<h1 className="text-3xl md:text-4xl">{title}</h1></div>{subtitle && <p className="mt-4 text-base text-muted-foreground max-w-3xl leading-relaxed">{subtitle}</p>}</div></section>;
}
export function FreeBadge({ text = "Tüm yolculuklar tamamen ÜCRETSİZDİR." }: { text?: string }) {
  return <div role="note" className="rounded-lg border border-success/30 bg-accent/25 p-4 font-medium flex items-start gap-3"><HeartHandshake className="size-6 text-success shrink-0" aria-hidden /><span>{text}</span></div>;
}
export function RoleGate({ need, children }: { need: Role; children: ReactNode }) {
  const role = useStore(s => s.role);
  if (role !== need) {
    const label = { yolcu: "Yolcu", gonullu: "Gönüllü", yonetici: "Yönetici" }[need];
    return <div className="mx-auto max-w-xl px-5 py-16 text-center"><ShieldCheck className="size-12 mx-auto text-muted-foreground mb-5" aria-hidden /><h2 className="text-2xl font-medium">Bu sayfa için yetki gerekli</h2><p className="mt-3 text-muted-foreground">Bu bölüm {label} rolündeki kullanıcılar içindir. Buradaki rol seçimi yalnızca demo içindir; gerçek hesap yetkisi sağlamaz.</p><Button variant="legacy" size="legacy" className="btn btn-primary mt-6" onClick={() => setState(() => ({ role: need }))}>Demo olarak {label} rolüne geç</Button></div>;
  }
  return <>{children}</>;
}
