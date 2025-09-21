import { NextRequest, NextResponse } from "next/server";
import { database } from "../../../lib/firebase";
import { ref, remove } from "firebase/database";

export async function POST(request: NextRequest) {
  try {
    const { userId, type, timestamp } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔌 Disconnecting user ${userId} from ${type || "unknown"} at ${new Date(
        timestamp
      ).toISOString()}`
    );

    // Remove user based on type
    if (type === "socialHub") {
      const userRef = ref(database, `socialHubUsers/${userId}`);
      await remove(userRef);
    } else {
      // Default to music page cleanup
      const userRef = ref(database, `tunedInUsers/${userId}`);
      await remove(userRef);
    }

    return NextResponse.json({
      success: true,
      message: "User disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting user:", error);
    return NextResponse.json(
      { error: "Failed to disconnect user", details: error.message },
      { status: 500 }
    );
  }
}
