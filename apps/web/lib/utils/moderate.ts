const BLACKLIST = new Set([
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'cunt', 'bastard',
  'nigga', 'nigger', 'fag', 'whore', 'slut', 'retard', 'porn',
  'spam', 'http://', 'https://'
]);

export function moderateContent(text: string): { clean: boolean; reason?: string } {
  if (!text || text.length > 500) {
    return { clean: false, reason: 'Message too long or empty' };
  }

  const lower = text.toLowerCase();
  for (const word of BLACKLIST) {
    if (lower.includes(word)) {
      return { clean: false, reason: 'Inappropriate content detected' };
    }
  }

  return { clean: true };
}

export function sanitizeChatInput(text: string): string {
  return String(text)
    .trim()
    .slice(0, 500)
    .replace(/[<>]/g, '');
}
