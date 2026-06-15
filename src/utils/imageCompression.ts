import imageCompression from 'browser-image-compression';

/**
 * Fungsi untuk mengompresi file gambar sebelum diupload ke Firebase Storage.
 * Sesuai Rule #5: Menghemat penyimpanan database.
 */
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5, // Maksimal ukuran file diset ke 500KB
    maxWidthOrHeight: 1024, // Resolusi maksimal, cukup tajam untuk tampilan mobile/tab
    useWebWorker: true, // Menggunakan thread terpisah agar tidak membuat UI lag/freeze saat proses kompresi
  };

  try {
    console.log(`Ukuran asli: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Proses kompresi
    const compressedFile = await imageCompression(file, options);
    
    console.log(`Ukuran setelah kompresi: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return compressedFile;
  } catch (error) {
    console.error("Gagal mengompres gambar, mengembalikan file asli:", error);
    // Fallback: Jika kompresi gagal karena alasan tertentu, kembalikan file aslinya 
    // agar proses upload tidak terhenti dan aplikasi tetap berjalan.
    return file;
  }
};