import { getChatModel } from '../../lib/ai.js';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

export const voiceParsedIntakeSchema = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional(),
  phone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  bloodGroup: z.enum(['UNKNOWN', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  allergies: z.array(z.string()).optional(),
  existingDiseases: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  temperatureC: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  heartRate: z.number().optional(),
  respiratoryRate: z.number().optional(),
  systolicBp: z.number().optional(),
  diastolicBp: z.number().optional(),
  isUnconscious: z.boolean().optional(),
  primarySymptom: z.string().optional(),
  primarySeverity: z.enum(['MILD', 'MODERATE', 'SEVERE']).optional(),
  secondarySymptoms: z.array(z.string()).optional(),
  chiefComplaint: z.string().optional(),
});

export type VoiceParsedIntake = z.infer<typeof voiceParsedIntakeSchema>;

export async function parseTranscriptToStructuredData(transcript: string): Promise<VoiceParsedIntake> {
  // Use gemini-flash-latest — it has better free-tier rate limits than 2.0-flash
  const model = getChatModel({ model: 'gemini-flash-latest', temperature: 0.1 })
    .withStructuredOutput(voiceParsedIntakeSchema, { name: 'voice_parsed_intake' });

  const messages = [
    new SystemMessage(
      `You are an AI assistant designed to parse unstructured clinical transcript notes spoken by a triage nurse.
Your goal is to extract the relevant patient demographic information, vital signs, symptom reports, and chief complaints, and map them into the requested structured schema.
If any value is not spoken or cannot be determined, do not make assumptions—leave it undefined or omit it from the response.
Map spoken numbers to actual numeric values (e.g. "thirty-seven degrees" to 37, "oxygen level is ninety-four percent" to 94).
Convert genders to uppercase MALE, FEMALE, OTHER, or UNKNOWN.
Convert blood group names to uppercase with underscores matching the enum values (e.g., "A positive" to "A_POSITIVE").
Convert symptoms severity to MILD, MODERATE, or SEVERE.`
    ),
    new HumanMessage(transcript),
  ];

  try {
    const response = await model.invoke(messages);
    return response;
  } catch (err: any) {
    // Provide a clearer error for quota issues
    if (err?.status === 429) {
      const error = new Error('Gemini API rate limit exceeded. Please wait a moment and try again.');
      (error as any).status = 429;
      throw error;
    }
    throw err;
  }
}

