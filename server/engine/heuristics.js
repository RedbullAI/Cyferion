export function analyzeMessage(text, sender) {
  let urgencyScore = 0, linkScore = 0, impersonationScore = 0;
  const flaggedKeywords = [], flaggedLinks = [];
  const normalizedText = text.toLowerCase();

  const urgencyWords = ['urgent', 'blocked', 'suspended', 'immediately', 'verify', 'freeze', 'disconnected', 'action required', 'expires'];
  urgencyWords.forEach((word) => {
    if (normalizedText.includes(word)) { urgencyScore += 3.5; flaggedKeywords.push(word); }
  });
  urgencyScore = Math.min(Math.round(urgencyScore), 10);

  const linkPatterns = [/https?:\/\/[^\s]+/g, /bit\.ly/g, /tinyurl\.com/g, /t\.co/g, /goo\.gl/g];
  let hasLinks = false;
  linkPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) { hasLinks = true; matches.forEach(m => { if (!flaggedLinks.includes(m)) flaggedLinks.push(m); }); }
  });
  if (hasLinks) { linkScore += 5; if (text.includes('http://')) { linkScore += 5; flaggedKeywords.push('unsecure link'); } }
  linkScore = Math.min(Math.round(linkScore), 10);

  const brands = ['sbi', 'hdfc', 'icici', 'paytm', 'netflix', 'post', 'electricity', 'kyc'];
  brands.forEach((brand) => {
    if (normalizedText.includes(brand)) {
      const isWhitelisted = sender.toUpperCase().includes(brand.toUpperCase());
      if (!isWhitelisted) { impersonationScore += 5; flaggedKeywords.push(`Unverified brand (${brand})`); }
    }
  });
  impersonationScore = Math.min(Math.round(impersonationScore), 10);

  const totalScore = Math.min(Math.round((urgencyScore * 0.3) + (linkScore * 0.4) + (impersonationScore * 0.3)), 10);
  let riskVerdict = 'safe';
  if (totalScore >= 7) riskVerdict = 'blocked';
  else if (totalScore >= 4) riskVerdict = 'quarantine';

  return { urgencyScore, linkScore, impersonationScore, totalScore, riskVerdict, flaggedKeywords, flaggedLinks };
}
