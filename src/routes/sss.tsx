import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/Layout";

export const Route = createFileRoute("/sss")({
  head: () => ({
    meta: [
      { title: "Sık Sorulan Sorular — Engelsiz Yol" },
      { name: "description", content: "Ücretsiz erişilebilir ulaşım ve gönüllülük hakkında sık sorulan sorular." },
      { property: "og:title", content: "Sık Sorulan Sorular — Engelsiz Yol" },
      { property: "og:description", content: "Engelsiz Yol hakkında merak edilenler." },
    ],
  }),
  component: Page,
});

const FAQ = [
  ["Yolculuklar gerçekten ücretsiz mi?", "Evet. Engelsiz Yol'da yolculardan hiçbir ücret alınmaz. Gönüllülerin ücret, bahşiş veya hediye istemesi yasaktır."],
  ["Gönüllüler nasıl doğrulanıyor?", "Kimlik, ehliyet ve araç ruhsatı ile adli sicil kaydı yöneticiler tarafından kontrol edilir. Doğrulanmayan gönüllüler talep üstlenemez."],
  ["Adresim kimlerle paylaşılıyor?", "Açık adresiniz herkese gösterilmez. Talebinizi üstlenen gönüllü ve siz karşılıklı onay verdikten sonra yalnızca o gönüllüyle paylaşılır."],
  ["Refakatçimle seyahat edebilir miyim?", "Evet. Talep formunda refakatçi seçeneğini işaretlemeniz yeterlidir."],
  ["Acil bir durumda ne yapmalıyım?", "Her sayfadaki kırmızı 'Acil / Destek' butonunu kullanın veya doğrudan 112'yi arayın."],
  ["Bu hizmet şu an aktif mi?", "Hayır. Engelsiz Yol bir sosyal bilgiler dersi projesidir ve demo prototiptir. Veriler örnektir."],
];

function Page() {
  return (
    <>
      <PageHeader title="Sık Sorulan Sorular" icon={<HelpCircle className="size-10" aria-hidden />} />
      <div className="mx-auto max-w-3xl px-4 py-10 grid gap-3">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card p-5 group">
            <summary className="font-bold text-xl cursor-pointer list-none flex justify-between gap-3">{q}<span aria-hidden className="group-open:rotate-45 transition-transform text-accent">+</span></summary>
            <p className="mt-3 text-lg text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
