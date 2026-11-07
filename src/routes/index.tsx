import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, ArrowRight, ArrowUpRight, HeartHandshake, ShieldCheck, MapPin, GraduationCap, Stethoscope, BriefcaseBusiness, Sparkles, Check, MessageCircle } from "lucide-react";
import landscape from "@/assets/warm-landscape.jpg";
import together from "@/assets/together-journey.jpg";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Engelsiz Yol — Birlikte Daha Özgür" },
    { name: "description", content: "Engelsiz Yol: engelli bireyleri gönüllü sürücülerle ücretsiz erişilebilir ulaşım için buluşturan dayanışma projesi." },
    { property: "og:title", content: "Engelsiz Yol — Birlikte Daha Özgür" },
    { property: "og:description", content: "Engelleri birlikte aşıyor, ücretsiz erişilebilir ulaşım için dayanışıyoruz." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});
const FAQ = [
  ["Yolculuklar gerçekten ücretsiz mi?", "Evet. Yolculardan ücret alınmaz. Gönüllüler ücret, bahşiş veya hediye talep edemez."],
  ["Kimler gönüllü olabilir?", "Kimlik, ehliyet, araç ruhsatı ve adli sicil kontrolünden geçen sürücüler gönüllü olabilir. Bu prototipte doğrulamalar demo olarak gösterilir."],
  ["Refakatçimle seyahat edebilir miyim?", "Evet. Ulaşım talebi oluştururken refakatçi seçeneğini işaretleyebilirsiniz."],
  ["Bu hizmet şu an aktif mi?", "Hayır. Engelsiz Yol bir sosyal bilgiler dersi projesidir. Gerçek ulaşım hizmeti henüz aktif değildir; mevcut yolculuklar örnek veridir."],
];
function Index() {
  const done = useStore(s => s.requests.filter(r => r.status === "tamamlandi").length);
  const volunteers = useStore(s => s.volunteers.filter(v => v.status === "onayli").length);
  return <>
    <section className="warm-hero">
      <img src={landscape} width={1920} height={1024} alt="Pastel dağlar ve göl boyunca uzanan yolda tekerlekli sandalye kullanan bir kişi ve yol arkadaşı; ileride erişilebilir bir minibüs." fetchPriority="high" />
      <div className="warm-hero-content fade-up">
        <p className="inline-flex items-center gap-2 text-xs font-medium mb-5"><span className="size-2 rounded-full bg-success" aria-hidden /> DAYANIŞMAYLA AÇILAN YOLLAR</p>
        <h1>Engelsiz Yol</h1>
        <p className="text-2xl md:text-3xl font-medium mt-3 leading-snug">Birlikte daha özgür,<br className="sm:hidden" /> birlikte daha güçlüyüz.</p>
        <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">Engelleri birlikte aşmak için ihtiyaç duyan bireyleri gönüllülerle güvenli ve kolay bir şekilde buluşturuyoruz.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/talep" className="btn btn-primary !px-7">Yardım Al <ArrowUpRight className="size-5" aria-hidden /></Link>
          <Link to="/gonullu" className="btn btn-outline !px-7">Gönüllü Ol <HeartHandshake className="size-5" aria-hidden /></Link>
        </div>
      </div>
    </section>
    <section className="border-y" aria-label="Demo istatistikleri"><div className="max-w-6xl mx-auto grid sm:grid-cols-3 py-6">
      {[{ n: `${volunteers}`, label: "Onaylı gönüllü (demo)", icon: HeartHandshake }, { n: `${done}`, label: "Tamamlanan yolculuk (demo)", icon: MapPin }, { n: "₺0", label: "Her yolculuk tamamen ücretsiz", icon: Accessibility }].map(s => <div key={s.label} className="home-stat flex items-center justify-center gap-4 px-6 py-4"><s.icon className="size-7 text-muted-foreground" aria-hidden /><div><p className="text-2xl font-medium">{s.n}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></div></div>)}
    </div></section>
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <div className="text-center"><p className="section-kicker mb-3">Küçük bir adım, büyük bir değişim</p><h2 className="text-3xl md:text-4xl font-medium">Birlikte yol almak çok kolay.</h2><p className="mt-4 text-muted-foreground">İhtiyacını paylaş. Bir gönüllüyle buluş. Hayata katıl.</p></div>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {[{ icon: MapPin, n: "01", title: "İhtiyacını paylaş", text: "Nereden nereye gitmek istediğini, tarihini ve erişim ihtiyaçlarını belirt.", color: "pastel-peach" }, { icon: HeartHandshake, n: "02", title: "Gönüllünle buluş", text: "Bölgesi ve aracı uygun bir gönüllü talebini üstlensin, karşılıklı onay verin.", color: "pastel-sage" }, { icon: Sparkles, n: "03", title: "Özgürce yol al", text: "Yolculuğunun durumunu takip et ve hiçbir ücret ödemeden hayata katıl.", color: "pastel-yellow" }].map(s => <article key={s.n} className="relative border-t pt-6"><div className="flex items-center justify-between mb-6"><span className={`size-14 grid place-items-center rounded-full ${s.color}`}><s.icon className="size-6" aria-hidden /></span><span className="text-sm text-muted-foreground">{s.n}</span></div><h3 className="text-xl font-medium">{s.title}</h3><p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">{s.text}</p></article>)}
      </div>
      <div className="text-center mt-9"><Link to="/nasil-calisir" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 min-h-11">Nasıl çalışır? <ArrowRight className="size-4" aria-hidden /></Link></div>
    </section>
    <section className="story-band"><div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="section-kicker mb-3">Hayatın her alanında yanındayız</p><h2 className="text-3xl font-medium">Seni hayata bağlayan yollar.</h2></div><Link to="/talep" className="inline-flex gap-2 items-center text-sm min-h-11">Ulaşım talebi oluştur <ArrowUpRight className="size-4" aria-hidden /></Link></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
        {[{ title: "Sağlık", text: "Randevuna birlikte ulaşalım.", icon: Stethoscope, color: "pastel-peach" }, { title: "Eğitim", text: "Öğrenmenin önünde engel yok.", icon: GraduationCap, color: "pastel-yellow" }, { title: "İş hayatı", text: "Her yeni güne eşit bir başlangıç.", icon: BriefcaseBusiness, color: "pastel-sage" }, { title: "Sosyal yaşam", text: "Hayatın güzel anlarını paylaş.", icon: Sparkles, color: "pastel-pink" }].map(c => <Link key={c.title} to="/talep" className={`rounded-lg p-5 md:p-6 ${c.color} group`}><c.icon className="size-8 mb-7" aria-hidden /><h3 className="font-medium text-lg flex items-center justify-between">{c.title}<ArrowUpRight className="size-4" aria-hidden /></h3><p className="text-sm mt-2 leading-relaxed">{c.text}</p></Link>)}
      </div>
    </div></section>
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      <img src={together} alt="Tekerlekli sandalye kullanan bir kadın ve gönüllü sürücü, rampalı aracın yanında sohbet ediyor." width={1280} height={960} loading="lazy" className="w-full rounded-lg" />
      <div><p className="section-kicker mb-4">Bir yolculuktan çok daha fazlası</p><h2 className="text-3xl md:text-4xl font-medium leading-tight">Senin küçük desteğin,<br />birinin büyük özgürlüğü.</h2><p className="mt-5 text-muted-foreground leading-relaxed">Bazen bir hastane randevusu, bazen bir ders, bazen de bir dostla buluşma. Paylaştığın zaman, birinin hayatında yeni bir kapı açabilir.</p><p className="mt-4 text-muted-foreground leading-relaxed">Engelli bireylerin bağımsızlığını ve onurunu gözeterek, karşılık beklemeden birlikte yol alıyoruz.</p><Link to="/gonullu" className="btn btn-primary mt-7">Gönüllü Ol <ArrowUpRight className="size-5" aria-hidden /></Link></div>
    </section>
    <section className="story-band"><div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
      <div><span className="size-14 grid place-items-center rounded-full pastel-sage mb-5"><ShieldCheck className="size-7" aria-hidden /></span><p className="section-kicker mb-3">Güvenle, yan yana</p><h2 className="text-3xl font-medium">Dayanışmanın temeli güven.</h2><ul className="mt-7 grid gap-4 text-sm">{["Gönüllü kimlik ve araç doğrulama süreci", "Karşılıklı onay sonrası adres paylaşımı", "Ücret, bahşiş ve hediye talebine sıfır tolerans"].map(t => <li key={t} className="flex items-center gap-3"><Check className="size-5 text-success shrink-0" aria-hidden />{t}</li>)}</ul><Link to="/sss" className="inline-flex gap-2 mt-7 text-sm items-center min-h-11">Merak ettiklerin <ArrowRight className="size-4" aria-hidden /></Link></div>
      <div className="border-t md:border-t-0 md:border-l md:pl-10 pt-7 md:pt-0"><span className="size-14 grid place-items-center rounded-full pastel-peach mb-5"><MapPin className="size-7" aria-hidden /></span><p className="section-kicker mb-3">Yolculuğundan haberdar ol</p><h2 className="text-3xl font-medium">Her adımda yanında.</h2><p className="mt-5 text-muted-foreground leading-relaxed">Talebinin oluşturulmasından gönüllü eşleşmesine, onaydan tamamlanmaya kadar yolculuğunun durumunu takip et.</p><p className="text-sm text-muted-foreground mt-4">Bu prototipte harita örnektir; canlı konum ve gerçek harita hizmeti bağlı değildir.</p><Link to="/takip" className="btn btn-outline mt-6">Yolculuğumu takip et <ArrowRight className="size-4" aria-hidden /></Link></div>
    </div></section>
    <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-[1fr_1.5fr] gap-10"><div><p className="section-kicker mb-3">Aklındaki sorular</p><h2 className="text-3xl font-medium">Birlikte, daha açık.</h2><p className="mt-4 text-muted-foreground">Yola çıkmadan önce bilmek istediklerin.</p><Link to="/sss" className="inline-flex gap-2 items-center mt-5 text-sm min-h-11">Tüm soruları gör <ArrowRight className="size-4" aria-hidden /></Link></div><div>{FAQ.map(([q,a]) => <details key={q} className="border-b py-5 group"><summary className="font-medium cursor-pointer list-none flex gap-4 justify-between">{q}<span className="group-open:rotate-45 text-xl shrink-0" aria-hidden>+</span></summary><p className="mt-4 text-sm text-muted-foreground leading-relaxed">{a}</p></details>)}</div></section>
    <section className="pastel-peach"><div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6"><div><p className="section-kicker mb-3">Senin sesin önemli</p><h2 className="text-3xl font-medium">Daha güzel yolları birlikte açalım.</h2><p className="mt-3 text-sm">Deneyimini, önerini veya sorunu bizimle paylaş.</p></div><Link to="/geri-bildirim" className="btn btn-outline shrink-0"><MessageCircle className="size-5" aria-hidden />İletişime geç <ArrowUpRight className="size-4" aria-hidden /></Link></div></section>
  </>;
}
