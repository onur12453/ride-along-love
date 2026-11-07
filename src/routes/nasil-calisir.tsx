import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/Layout";

export const Route = createFileRoute("/nasil-calisir")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Bu Proje Nasıl Çalışır? — Engelsiz Yol" },
      { name: "description", content: "Yolcu, gönüllü ve yönetici rolleriyle Engelsiz Yol'un işleyişi ve güvenlik sistemi." },
      { property: "og:title", content: "Bu Proje Nasıl Çalışır? — Engelsiz Yol" },
      { property: "og:description", content: "Toplumsal dayanışma ile ücretsiz erişilebilir ulaşım." },
    ],
  }),
  component: Page,
});

const STEPS = [
  ["1", "Yolcu talep oluşturur", "Başlangıç ve varış noktası, tarih-saat, tekerlekli sandalye ve refakatçi bilgisi girilir."],
  ["2", "Doğrulanmış gönüllü üstlenir", "Bölgesi ve aracı uygun olan gönüllü talebi üstlenir. Durum: 'Gönüllü bulundu'."],
  ["3", "Karşılıklı onay", "Yolcu ve gönüllü onay verir; ancak bundan sonra açık adres paylaşılır. Durum: 'Yolculuk onaylandı'."],
  ["4", "Yolculuk tamamlanır", "Gönüllü yolculuğu tamamlandı olarak işaretler. Yolcu geri bildirim bırakabilir."],
];

function Page() {
  return (
    <>
      <PageHeader title="Bu Proje Nasıl Çalışır?" subtitle="Dayanışmayla engelleri kaldıran basit bir süreç." icon={<Lightbulb className="size-10" aria-hidden />} />
      <div className="mx-auto max-w-5xl px-4 py-10 grid gap-10">
        <ol className="grid md:grid-cols-2 gap-5">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="card p-6 flex gap-4">
              <span className="grid place-items-center size-12 shrink-0 rounded-full bg-accent text-accent-foreground text-xl font-bold" aria-hidden>{n}</span>
              <div><h2 className="text-xl font-bold">{t}</h2><p className="mt-1 text-lg text-muted-foreground">{d}</p></div>
            </li>
          ))}
        </ol>

        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Roller</h2>
          <ul className="mt-3 grid gap-2 text-lg">
            <li><b>Yolcu:</b> Talep oluşturur, yolculuğunu takip eder, onay ve geri bildirim verir.</li>
            <li><b>Gönüllü:</b> Doğrulama sürecinden geçer, uygun gün/bölge seçer, talepleri üstlenir.</li>
            <li><b>Yönetici:</b> Başvuruları doğrular, talepleri ve şikâyetleri denetler.</li>
          </ul>
        </section>

        <section className="card p-6 md:p-8 bg-secondary">
          <h2 className="text-2xl font-bold">Toplumsal dayanışma ve gönüllülük</h2>
          <p className="mt-3 text-lg">Dayanışma; toplumun her bireyinin eşit haklarla hayata katılabilmesi için birbirimize destek olmamızdır. Gönüllülük ise karşılık beklemeden zaman ve emek paylaşmaktır. Ulaşıma erişim; eğitim, sağlık, çalışma ve sosyal hayat haklarının temelidir. Engelli bireylerin bağımsızlığını ve onurunu gözeten bir destek, hepimizin daha adil bir toplumda yaşamasını sağlar.</p>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Teknik not (demo)</h2>
          <ul className="mt-3 grid gap-2 text-lg list-disc pl-6">
            <li>Gerçek bir veri tabanı ve harita servisi bağlı <b>değildir</b>; veriler örnektir ve yalnızca tarayıcınızda saklanır.</li>
            <li>Roller sağ üstteki menüden demo amaçlı seçilir. Gerçek sistemde güvenli giriş, şifreleme ve sunucu taraflı yetkilendirme kullanılmalıdır.</li>
            <li>Gerçek kişilere ait bilgiler kullanılmamıştır.</li>
          </ul>
        </section>
        <Link to="/talep" className="btn btn-primary text-xl justify-self-center">Ücretsiz Ulaşım İste</Link>
      </div>
    </>
  );
}
