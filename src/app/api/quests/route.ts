import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/firebase-admin";
import { unstable_cache } from "next/cache";

// Fungsi untuk mengambil data dari Firestore
async function fetchQuestsFromDB(gameId: string, tierId: string) {
  const docRef = dbAdmin
    .collection("game_banks")
    .doc(gameId)
    .collection("tiers")
    .doc(tierId);
  
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) return null;
  return docSnap.data();
}

// Gunakan unstable_cache untuk menyimpan hasil query ke memori server
const getCachedQuests = unstable_cache(
  async (gameId: string, tierId: string) => fetchQuestsFromDB(gameId, tierId),
  ["kido-quests"], // Tag unik untuk caching
  { tags: ["kido-quests"], revalidate: 3600 } // Revalidasi tiap 1 jam
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const tierId = searchParams.get("tierId"); // Contoh: tier1, tier2

  if (!gameId || !tierId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const data = await getCachedQuests(gameId, tierId);
  
  if (!data) {
    return NextResponse.json({ error: "Data not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}