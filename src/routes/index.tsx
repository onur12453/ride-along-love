import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, Car, HeartHandshake, ShieldCheck, Users, MapPin } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Engelsiz Yol — Engelsiz Yolculuk, Birlikte Mümkün!" },
      { name: "description", content: "Gönüllülerle engelleri aş, ücretsiz ve erişilebilir ulaşım desteğiyle hayata katıl." },
      { property: "og:title", content: "Engelsiz Yol — Ücretsiz Erişilebilir Ulaşım" },
      { property: "og:description", content: "Engelli bireyleri gönüllü sürücülerle ücretsiz buluşturan platform." },
    ],
  }),
  component: Index,
});

function Index() {
  const done = useStore((s) => s.requests.filter((r) => r.status === "tamamlandi").length);
  const vols = useStore((s) => s.volunteers.filter((v) => v.status === "onayli").length);
  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="fade-up">
            <p className="inline-block rounded-full bg-primary-foreground/15 px-4 py-1 font-semibold mb-4">%100 Ücretsiz · Gönüllü Destekli</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">Engelsiz Yolculuk, Birlikte Mümkün!</h1>
            <p className="mt-5 text-xl md:text-2xl opacity-95">Gönüllülerle engelleri aş, ücretsiz ve erişilebilir ulaşım desteğiyle hayata katıl.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/talep" className="btn bg-card text-primary text-xl !py-5 !px-8 shadow-soft"><Accessibility aria-hidden /> Ücretsiz Ulaşım İste</Link>
              <Link to="/gonullu" className="btn btn-accent text-xl !py-5 !px-8 shadow-soft"><HeartHandshake aria-hidden /> Gönüllü Ol</Link>
            </div>
          </div>
          <img src={hero} width={1280} height={960} alt="Bir gönüllü sürücü, tekerlekli sandalyedeki bir kadının rampalı araca binmesine yardım ediyor; yanında refakatçisi var." className="rounded-3xl shadow-soft w-full fade-up" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 -mt-8 relative grid sm:grid-cols-3 gap-4" aria-label="Demo istatistikleri">
        {[
          { i: <Users aria-hidden />, n: vols, l: "Onaylı gönüllü (demo)" },
          { i: <Car aria-hidden />, n: done, l: "Tamamlanan yolculuk (demo)" },
          { i: <span aria-hidden className="text-2xl font-bold">₺0</span>, n: "Ücret", l: "Yolcudan hiçbir ücret alınmaz" },
        ].map((s, k) => (
          <div key={k} className="card p-6 flex items-center gap-4">
            <div className="grid place-items-center size-14 rounded-2xl bg-sky text-primary">{s.i}</div>
            <div><p className="text-3xl font-bold">{s.n}</p><p className="text-muted-foreground">{s.l}</p></div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Nasıl destek oluyoruz?</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { i: <MapPin />, t: "Talebini oluştur", d: "Nereden nereye gideceğini, tarih ve erişim ihtiyaçlarını yaz." },
            { i: <HeartHandshake />, t: "Gönüllü eşleşsin", d: "Doğrulanmış, uygun araçlı bir gönüllü talebini üstlenir." },
            { i: <ShieldCheck />, t: "Güvenle yolculuk et", d: "Karşılıklı onaydan sonra adres paylaşılır, yolculuğu takip edersin." },
          ].map((c) => (
            <div key={c.t} className="card p-7">
              <div className="grid place-items-center size-14 rounded-2xl bg-accent text-accent-foreground mb-4" aria-hidden>{c.i}</div>
              <h3 className="text-2xl font-bold">{c.t}</h3>
              <p className="mt-2 text-lg text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="card p-8 md:p-12 bg-secondary grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-3xl font-bold">Toplumsal dayanışma, gönüllülükle büyür</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl">Ulaşım, eğitime, sağlığa, işe ve sosyal hayata katılmanın anahtarıdır. Haftada birkaç saatini ayıran her gönüllü, birinin hayatında gerçek bir kapı açar. Engelli bireylerin onuru ve bağımsızlığı her zaman önceliğimizdir.</p>
          </div>
          <Link to="/nasil-calisir" className="btn btn-primary text-lg">Bu proje nasıl çalışır?</Link>
        </div>
      </section>
    </>
  );
}
