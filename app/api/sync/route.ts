import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const { roomCode, content } = await req.json();

    if (!roomCode || !content) {
      return NextResponse.json({
        message: "Missing roomCode or content",
        status: 400,
      });
    }

    await pusher.trigger(`room-${roomCode}`, "on-sync", {
      message: content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error in /api/sync:", error);
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
