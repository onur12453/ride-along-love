// DEMO veri katmanı: gerçek veritabanı yok, veriler tarayıcıda (localStorage) saklanır.
import { useSyncExternalStore } from "react";

export type Role = "yolcu" | "gonullu" | "yonetici";
export type Status = "olusturuldu" | "gonullu_bulundu" | "onaylandi" | "tamamlandi";

export const STATUS_LABEL: Record<Status, string> = {
  olusturuldu: "Talep oluşturuldu",
  gonullu_bulundu: "Gönüllü bulundu",
  onaylandi: "Yolculuk onaylandı",
  tamamlandi: "Yolculuk tamamlandı",
};
export const STATUS_ORDER: Status[] = ["olusturuldu", "gonullu_bulundu", "onaylandi", "tamamlandi"];

export interface RideRequest {
  id: string;
  passenger: string;
  from: string;
  fromDistrict: string;
  to: string;
  toDistrict: string;
  date: string;
  time: string;
  wheelchair: boolean;
  special: string;
  companion: boolean;
  note: string;
  status: Status;
  volunteerId?: string | undefined;
  passengerOk: boolean;
  volunteerOk: boolean;
  mine?: boolean;
}
export interface Volunteer {
  id: string;
  name: string;
  status: "beklemede" | "onayli" | "reddedildi";
  regions: string[];
  days: string[];
  wheelchairCar: boolean;
  idChecked: boolean;
  licenseChecked: boolean;
  recordChecked: boolean;
}
export interface Complaint {
  id: string;
  type: "sikayet" | "geri_bildirim";
  subject: string;
  message: string;
  status: "acik" | "inceleniyor" | "cozuldu";
  date: string;
}

interface State {
  role: Role;
  fontScale: number;
  contrast: boolean;
  requests: RideRequest[];
  volunteers: Volunteer[];
  complaints: Complaint[];
  meVolunteerId: string;
}

export const DISTRICTS = ["Kadıköy", "Üsküdar", "Beşiktaş", "Şişli", "Bakırköy", "Ataşehir", "Fatih", "Maltepe"];
export const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const seed: State = {
  role: "yolcu",
  fontScale: 1,
  contrast: false,
  meVolunteerId: "v1",
  volunteers: [
    { id: "v1", name: "Örnek Gönüllü (Siz)", status: "onayli", regions: ["Kadıköy", "Üsküdar"], days: ["Salı", "Cumartesi"], wheelchairCar: true, idChecked: true, licenseChecked: true, recordChecked: true },
    { id: "v2", name: "Gönüllü A. K.", status: "beklemede", regions: ["Beşiktaş"], days: ["Pazartesi"], wheelchairCar: false, idChecked: true, licenseChecked: false, recordChecked: false },
    { id: "v3", name: "Gönüllü M. D.", status: "onayli", regions: ["Şişli", "Fatih"], days: ["Cuma", "Pazar"], wheelchairCar: true, idChecked: true, licenseChecked: true, recordChecked: true },
  ],
  requests: [
    { id: "T-1001", passenger: "Yolcu E. Y.", from: "Örnek Sk. No:1", fromDistrict: "Kadıköy", to: "Örnek Hastanesi", toDistrict: "Üsküdar", date: "2026-10-20", time: "10:00", wheelchair: true, special: "Rampa", companion: true, note: "", status: "olusturuldu", passengerOk: false, volunteerOk: false },
    { id: "T-1002", passenger: "Yolcu S. B.", from: "Örnek Cd. No:5", fromDistrict: "Ataşehir", to: "Kültür Merkezi", toDistrict: "Kadıköy", date: "2026-10-22", time: "14:30", wheelchair: false, special: "Görme engeli – rehber köpek", companion: false, note: "", status: "olusturuldu", passengerOk: false, volunteerOk: false },
    { id: "T-1003", passenger: "Yolcu H. T.", from: "Örnek Sk. No:9", fromDistrict: "Şişli", to: "Belediye Binası", toDistrict: "Fatih", date: "2026-10-10", time: "09:00", wheelchair: true, special: "", companion: false, note: "", status: "tamamlandi", volunteerId: "v3", passengerOk: true, volunteerOk: true },
  ],
  complaints: [
    { id: "S-1", type: "geri_bildirim", subject: "Çok nazik bir gönüllü", message: "Yolculuk çok rahattı, teşekkürler.", status: "cozuldu", date: "2026-10-10" },
    { id: "S-2", type: "sikayet", subject: "Gecikme", message: "Gönüllü 20 dakika geç geldi.", status: "acik", date: "2026-10-11" },
  ],
};

const KEY = "engelsiz-yol-demo-v1";
let state: State = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed, ...JSON.parse(raw) };
  } catch {}
}
export function setState(fn: (s: State) => Partial<State>) {
  load();
  state = { ...state, ...fn(state) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}
export function resetDemo() {
  setState(() => seed);
}
function subscribe(l: () => void) {
  load();
  listeners.add(l);
  queueMicrotask(l);
  return () => listeners.delete(l);
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(seed));
}
export const uid = (p: string) => `${p}-${Math.floor(1000 + Math.random() * 9000)}`;

/** Adres gizliliği: karşılıklı onay olmadan sadece ilçe gösterilir. */
export function maskAddress(r: RideRequest, side: "from" | "to") {
  const district = side === "from" ? r.fromDistrict : r.toDistrict;
  const full = side === "from" ? r.from : r.to;
  return r.passengerOk && r.volunteerOk ? `${full}, ${district}` : `${district} (açık adres onay sonrası paylaşılır)`;
}
