"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, User, Lock, Delete, Loader2 } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

export default function ChildLogin() {
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk alur login PIN
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);

  // Cek apakah HP ini sudah pernah dipakai login oleh orang tua
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Tarik data anak-anak yang terhubung dengan akun Google orang tua ini
        try {
          const q = query(collection(db, "children"), where("parentId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const childrenList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setChildrenData(childrenList);
        } catch (error) {
          console.error("Gagal menarik data anak:", error);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fungsi Keypad Custom
  const handleKeyPress = (num: string) => {
    setIsError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit saat digit ke-4 ditekan
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setIsError(false);
    setPin(pin.slice(0, -1));
  };

  const verifyPin = (enteredPin: string) => {
    // Karena kita belum set PIN beneran di database (Fase 1), 
    // untuk sementara kita pakai PIN universal "1234" buat ngetes UI
    const correctPin = selectedChild.pin || "1234"; 

    if (enteredPin === correctPin) {
      // SET STATE GLOBAL BAHWA ANAK INI YANG SEDANG MAIN
      useGameStore.setState({ 
        xp: selectedChild.xp || 0,
        level: selectedChild.level || 1,
        coins: selectedChild.coins || 0
      });
      
      // Lempar ke Dashboard Anak
      router.push("/child");
    } else {
      // PIN Salah
      setIsError(true);
      setTimeout(() => {
        setPin(""); // Kosongkan PIN setelah 0.5 detik biar anak bisa coba lagi
        setIsError(false);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Jika Orang Tua belum pernah login di HP ini
  if (childrenData.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Pintu Terkunci!</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          Minta Ayah atau Bunda untuk login dan mendaftarkan profilmu dulu ya.
        </p>
        <button 
          onClick={() => router.push("/login")}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          Kembali ke Depan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => selectedChild ? setSelectedChild(null) : router.push("/login")}
          className="p-3 bg-white text-slate-500 hover:text-slate-800 rounded-full shadow-sm mb-8 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* TAMPILAN 1: PILIH PROFIL ANAK */}
        {!selectedChild ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h1 className="text-3xl font-black text-slate-800 text-center mb-8">
              Siapa yang mau main?
            </h1>
            
            <div className="grid grid-cols-2 gap-4">
              {childrenData.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center group active:scale-95"
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-10 h-10" />
                  </div>
                  <p className="font-extrabold text-slate-700 text-lg capitalize">{child.name}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (

        /* TAMPILAN 2: MASUKKAN PIN ANAK */
          <div className="animate-in slide-in-from-right-8 duration-300 flex flex-col items-center">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Hai, {selectedChild.name}!</h2>
            <p className="text-slate-500 font-medium mb-8">Masukkan PIN rahasiamu</p>

            {/* Kotak PIN Indicator */}
            <div className={`flex space-x-4 mb-10 ${isError ? 'animate-pulse' : ''}`}>
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                    pin.length > index 
                      ? isError ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200' : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-110'
                      : 'bg-white text-slate-300 border-2 border-slate-200'
                  }`}
                >
                  {pin.length > index ? "•" : ""}
                </div>
              ))}
            </div>

            {/* Pesan Eror */}
            {isError && <p className="text-rose-500 font-bold mb-4">PIN Salah, coba lagi!</p>}

            {/* Keypad Angka Custom */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-white h-16 rounded-2xl text-2xl font-black text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 active:scale-90 transition-all border border-slate-100"
                >
                  {num}
                </button>
              ))}
              <div className="col-start-2">
                <button
                  onClick={() => handleKeyPress("0")}
                  className="w-full bg-white h-16 rounded-2xl text-2xl font-black text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 active:scale-90 transition-all border border-slate-100"
                >
                  0
                </button>
              </div>
              <div className="col-start-3">
                <button
                  onClick={handleDelete}
                  className="w-full bg-slate-200 h-16 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm hover:bg-rose-100 hover:text-rose-600 active:scale-90 transition-all"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}