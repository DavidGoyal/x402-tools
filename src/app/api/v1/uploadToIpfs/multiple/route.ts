import { uploadMultipleToLighthouse } from "@/actions/upload-to-lighthouse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length <= 1) {
      return Response.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }
    const ipfsHash = await uploadMultipleToLighthouse(files);

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
