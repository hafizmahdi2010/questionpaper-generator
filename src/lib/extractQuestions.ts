/**
 * Parse the AI-generated question paper markdown and return only the
 * actual question texts (no instructions, no headers, no section labels).
 */
export function extractQuestions(text: string): string[] {
  if (!text) return [];

  // 1) Strip "General Instructions" / "Instructions" blocks entirely.
  //    They commonly contain numbered lists like "1. All questions are compulsory."
  //    which would otherwise be mis-detected as questions.
  let cleaned = text.replace(
    /(^|\n)\s*#{0,6}\s*(general\s+)?instructions?\s*:?[\s\S]*?(?=\n\s*#{1,6}\s|\n\s*(section|part)\s+[a-z0-9]|\n\s*(question\s*\d+|q\s*\.?\s*\d+)|$)/gi,
    '\n'
  );

  const questions: string[] = [];

  // 2) Prefer explicit "Question N" / "Q.N" / "QN:" markers.
  const explicitRe = /(?:^|\n)\s*(?:\*{0,2})\s*(?:Question|Q\.?)\s*[#:]?\s*(\d+)[\.\):\-\s]+([\s\S]*?)(?=(?:\n\s*(?:\*{0,2})\s*(?:Question|Q\.?)\s*[#:]?\s*\d+[\.\):\-\s])|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = explicitRe.exec(cleaned)) !== null) {
    const body = m[2].trim();
    if (body) questions.push(body);
  }
  if (questions.length > 0) return questions.map(cleanQ);

  // 3) Fallback: numbered list "1." "2." etc., but skip items that look like
  //    instructions or section headers.
  const numberedRe = /(?:^|\n)\s*(\d+)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*\d+[\.\)]\s)|\n\s*(?:section|part)\s+[a-z0-9]|$)/gi;
  while ((m = numberedRe.exec(cleaned)) !== null) {
    const body = m[2].trim();
    if (!body) continue;
    if (looksLikeInstruction(body)) continue;
    questions.push(body);
  }
  return questions.map(cleanQ);
}

function looksLikeInstruction(s: string): boolean {
  const lower = s.toLowerCase().slice(0, 200);
  return /(all questions are|question paper consists|attempt all|marks each|internal choice|time allowed|maximum marks|read the following|use of calculator|figures to the right)/i.test(lower);
}

function cleanQ(s: string): string {
  return s.replace(/^\*+|\*+$/g, '').trim();
}
