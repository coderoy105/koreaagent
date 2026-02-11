import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existingBucket } = await supabase.storage.getBucket("book-covers");
    if (!existingBucket) {
      const { error: bucketError } = await supabase.storage.createBucket("book-covers", {
        public: true,
      });
      if (bucketError && bucketError.message !== "Bucket already exists") {
        console.error("Bucket create error:", bucketError);
        return NextResponse.json({ error: "Failed to prepare storage" }, { status: 500 });
      }
    }

    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `book-cover-${Date.now()}-${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Cover upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const { data } = supabase.storage.from("book-covers").getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Cover upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
