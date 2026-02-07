import { NextResponse } from "next/server";
import { calculateChildPugh } from "@/lib/calculators";
import { childPughSchema } from "@/lib/validators/parameter-schemas";
import { appendCalculation } from "@/lib/db/local-store";
import { scoringSystems } from "@/lib/db/seed-data";

export const runtime = "nodejs";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { systemId, parameters } = body ?? {};

    if (systemId !== "child_pugh") {
      return NextResponse.json(
        { error: "Only child_pugh is supported in this endpoint for now." },
        { status: 400 }
      );
    }

    const validatedParams = childPughSchema.parse(parameters);
    const result = calculateChildPugh(validatedParams);

    const system = scoringSystems.find((item) => item.id === systemId);
    if (!system) {
      return NextResponse.json(
        { error: "Scoring system not found in local definitions." },
        { status: 404 }
      );
    }

    const calculation = await appendCalculation({
      systemId,
      inputParameters: validatedParams,
      result
    });

    return NextResponse.json({
      id: calculation.id,
      systemId,
      result
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid input or calculation error." },
      { status: 400 }
    );
  }
};
