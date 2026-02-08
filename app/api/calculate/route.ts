import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateChildPugh, calculateMeld } from "@/lib/calculators";
import { childPughSchema, meldSchema } from "@/lib/validators/parameter-schemas";
import { appendCalculation } from "@/lib/db/local-store";
import { scoringSystems } from "@/lib/db/seed-data";
import {
  guessScoringSystemFromParameterKeys,
  guessScoringSystemFromSearch
} from "@/lib/scoring-system-matcher";

export const runtime = "nodejs";

type CalculationRequestBody = {
  systemId?: unknown;
  parameterSearch?: unknown;
  parameters?: unknown;
};

const resolveSystemId = (body: CalculationRequestBody) => {
  if (typeof body.systemId === "string" && body.systemId.trim()) {
    return {
      systemId: body.systemId.trim(),
      guessedFrom: null as null | "search" | "parameter_keys",
      guessConfidence: null as null | number
    };
  }

  if (typeof body.parameterSearch === "string" && body.parameterSearch.trim()) {
    const guessed = guessScoringSystemFromSearch(body.parameterSearch);
    if (guessed) {
      return {
        systemId: guessed.system.id,
        guessedFrom: "search" as const,
        guessConfidence: guessed.confidence
      };
    }
  }

  if (body.parameters && typeof body.parameters === "object" && !Array.isArray(body.parameters)) {
    const guessed = guessScoringSystemFromParameterKeys(body.parameters as Record<string, unknown>);
    if (guessed) {
      return {
        systemId: guessed.system.id,
        guessedFrom: "parameter_keys" as const,
        guessConfidence: guessed.confidence
      };
    }
  }

  return {
    systemId: null,
    guessedFrom: null as null | "search" | "parameter_keys",
    guessConfidence: null as null | number
  };
};

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as CalculationRequestBody;
    const { systemId, guessedFrom, guessConfidence } = resolveSystemId(body);
    const parameters = body?.parameters;

    if (!systemId) {
      return NextResponse.json(
        {
          error:
            "Could not determine scoring system. Provide systemId, or include parameterSearch/parameter keys.",
          availableSystems: scoringSystems.map((item) => ({
            id: item.id,
            name: item.name
          }))
        },
        { status: 400 }
      );
    }

    const system = scoringSystems.find((item) => item.id === systemId);
    if (!system) {
      return NextResponse.json({ error: "Scoring system not found in local definitions." }, { status: 404 });
    }

    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
      return NextResponse.json({ error: "Parameters must be an object." }, { status: 400 });
    }

    let validatedParams: unknown;
    let result: unknown;

    switch (systemId) {
      case "child_pugh": {
        const parsed = childPughSchema.parse(parameters);
        validatedParams = parsed;
        result = calculateChildPugh(parsed);
        break;
      }
      case "meld": {
        const parsed = meldSchema.parse(parameters);
        validatedParams = parsed;
        result = calculateMeld(parsed);
        break;
      }
      default: {
        return NextResponse.json(
          { error: `Scoring system '${systemId}' is known but not yet executable.` },
          { status: 400 }
        );
      }
    }

    let calculationId: string | null = null;
    try {
      const calculation = await appendCalculation({
        systemId,
        inputParameters: validatedParams,
        result
      });
      calculationId = calculation.id;
    } catch (storageError) {
      // Local filesystem storage can fail in serverless/readonly deployments.
      console.warn("Calculation persistence failed; returning result without storage.", storageError);
    }

    return NextResponse.json({
      id: calculationId,
      systemId,
      guessedFrom,
      guessConfidence,
      result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid parameters for the selected scoring system.",
          details: error.issues.map((issue) => issue.message)
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid input or calculation error." },
      { status: 400 }
    );
  }
};
