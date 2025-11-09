import { uploadToLighthouse } from "@/actions/upload-to-lighthouse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }
    const ipfsHash = await uploadToLighthouse(file);

    return Response.json({ success: true, ipfsHash }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
