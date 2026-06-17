import BGMPlayer from "@/components/BGMPlayer";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Mesin musik dipasang di sini, jadi dia bakal mengayomi semua halaman game! */}
      <BGMPlayer />
      {/* Konten halamannya (Lobi, Peta Level, Main Game) muncul di sini */}
      {children}
    </>
  );
}