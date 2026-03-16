import { EnvLine } from "./envParser.js";

export interface Pattern {
  name: string;
  regex: RegExp;
  minEntropy?: number;
  keyPattern?: RegExp;
}

export interface SecretIssue {
  key: string;
  type: string;
  line: number;
}

/**
 * Calculates Shannon entropy of a string.
 * High entropy indicates a potential secret (randomness).
 */
function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return Object.values(frequencies).reduce((acc, freq) => {
    const p = freq / len;
    return acc - p * Math.log2(p);
  }, 0);
}

const PATTERNS = [
  // AWS
  { name: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/ },
  {
    name: "AWS Secret Access Key",
    regex: /(?<![A-Za-z0-9])[A-Za-z0-9/+]{40}(?![A-Za-z0-9/+])/,
    keyPattern: /AWS|SECRET|PASSWORD|TOKEN|KEY/i, // Suspected key names
  },

  // Paystack (Check before Stripe as it's more specific/longer)
  { name: "Paystack Live Secret Key", regex: /sk_live_[a-zA-Z0-9]{40,}/ },
  { name: "Paystack Test Secret Key", regex: /sk_test_[a-zA-Z0-9]{40,}/ },

  // Stripe
  { name: "Stripe Live Secret Key", regex: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: "Stripe Test Secret Key", regex: /sk_test_[0-9a-zA-Z]{24,}/ },

  // GitHub
  {
    name: "GitHub Personal Access Token (classic)",
    regex: /ghp_[0-9a-zA-Z]{36}/,
  },
  { name: "GitHub Fine-grained Token", regex: /github_pat_[0-9a-zA-Z_]{82}/ },
  { name: "GitHub OAuth Token", regex: /gho_[0-9a-zA-Z]{36}/ },
  { name: "GitHub Actions Token", regex: /ghs_[0-9a-zA-Z]{36}/ },

  // Slack
  {
    name: "Slack Bot Token",
    regex: /xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{23,25}/,
  },
  {
    name: "Slack User Token",
    regex: /xoxp-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{23,25}/,
  },
  {
    name: "Slack Webhook URL",
    regex:
      /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/,
  },

  // Twilio
  { name: "Twilio Account SID", regex: /AC[a-zA-Z0-9]{32}/ },
  { name: "Twilio Auth Token", regex: /SK[a-zA-Z0-9]{32}/ },

  // SendGrid
  {
    name: "SendGrid API Key",
    regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
  },

  // Mailgun
  { name: "Mailgun API Key", regex: /key-[0-9a-zA-Z]{32}/ },

  // Private keys
  { name: "Private Key (PEM)", regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/ },
  { name: "Certificate", regex: /-----BEGIN CERTIFICATE-----/ },

  // Generic high-entropy patterns (base64 and hex)
  {
    name: "High-entropy base64 secret",
    regex: /(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{40,}={0,2}(?![A-Za-z0-9+/=])/,
    minEntropy: 4.5,
  },
  {
    name: "High-entropy hex secret",
    regex: /(?<![0-9a-fA-F])[0-9a-fA-F]{32,}(?![0-9a-fA-F])/,
    minEntropy: 3.5,
  },
];

/**
 * Scans environment lines for potential secret leaks.
 */
export function scanSecrets(lines: EnvLine[]): SecretIssue[] {
  const issues: SecretIssue[] = [];

  lines.forEach((line, index) => {
    if (!line.key) return;

    for (const pattern of PATTERNS) {
      const match =
        line.value.match(pattern.regex) || line.raw.match(pattern.regex);
      if (match) {
        // If pattern has an entropy threshold, check it
        if (pattern.minEntropy) {
          const entropy = calculateEntropy(match[0]);
          if (entropy < pattern.minEntropy) continue;
        }

        // If pattern has a key name restriction, check it
        if (pattern.keyPattern && !pattern.keyPattern.test(line.key)) {
          continue;
        }

        issues.push({
          key: line.key,
          type: pattern.name,
          line: index + 1,
        });
        break; // one match per line is enough
      }
    }
  });

  return issues;
}
