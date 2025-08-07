# Secrets Detector

A Node.js library that automatically detects secrets in your codebase before committing to Git. Built on top of [Gitleaks](https://github.com/gitleaks/gitleaks) with smart configuration management.

## Features

- 🔍 **Detects secrets**: AWS keys, JWT tokens, API keys, private keys, and more
- ⚙️ **Smart configuration**: Extends default rules with your custom patterns
- 🔧 **Customizable**: Add your own secret patterns

## Quick Start

### Installation

```bash
npm install secrets-detector
```

The library automatically sets up pre-commit hooks when installed.

### Manual Run

```bash
npm run gitleaks:run
```

## Supported Secrets

- **AWS**: Access Key IDs, Secret Access Keys
- **GitHub**: Personal Access Tokens
- **JWT**: Bearer tokens, Authorization headers
- **API Keys**: Generic patterns for any service
- **Private Keys**: RSA, EC, SSH keys
- **Database**: Passwords for MySQL, PostgreSQL, Redis

## Configuration

### Option 1: `.gitleaks.json` File

Create a `.gitleaks.json` file in your project root:

```json
{
  "exclude": ["my-custom-dir/", "temp/"],
  "rules": [
    {
      "id": "custom-api-key",
      "description": "Custom API key pattern",
      "regex": "(?i)(custom_api_key)\\s*[=:]\\s*[\"']?[A-Za-z0-9+/=]{20,}[\"']?",
      "tags": ["custom", "api"],
      "severity": "HIGH"
    }
  ]
}
```

### Option 2: `package.json` Configuration

```json
{
  "name": "my-project",
  "gitleaksConfig": {
    "exclude": ["my-dir/"],
    "rules": [
      {
        "id": "my-custom-rule",
        "description": "My custom secret pattern",
        "regex": "my_pattern_here",
        "tags": ["custom"],
        "severity": "HIGH"
      }
    ]
  }
}
```

## How It Works

1. **Pre-commit**: Automatically runs before each commit
2. **Smart scanning**: Scans staged files or entire directory
3. **Custom rules**: Extends default rules with your patterns
4. **Block commits**: Prevents commits if secrets are found

## Custom Rules

### Rule Structure

```json
{
  "id": "unique-rule-id",
  "description": "Description of what this detects",
  "regex": "your_regex_pattern",
  "tags": ["category"],
  "severity": "HIGH"
}
```

### Common Patterns

```javascript
// AWS Access Key
"AWS_ACCESS_KEY_ID\\s*=\\s*[\"']?AKIA[A-Z0-9]{16}[\"']?";

// JWT Token
"Bearer\\s+eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*";

// GitHub Token
"ghp_[A-Za-z0-9]{36}";

// Generic API Key
"[A-Z_]*API_KEY\\s*=\\s*[\"']?[A-Za-z0-9+/=]{20,}[\"']?";
```

## Troubleshooting

### No secrets detected but they exist

- Check if files are excluded in configuration
- Verify secret format matches patterns

### False positives

- Add specific exclusions
- Refine regex patterns
- Use more specific rules


## CI/CD Integration

```yaml
# GitHub Actions
- name: Security Scan
  run: |
    npm install secrets-detector
    npm run gitleaks:run
```

## Development

```bash
# Clone and setup
git clone https://github.com/FemiOfficial/secrets-detector.git
cd secrets-detector
npm install
npm run build

# Test
npm run gitleaks:run
```

## License

ISC License - see [LICENSE](LICENSE) file.

## Support

- **Issues**: [GitHub Issues](https://github.com/FemiOfficial/secrets-detector/issues)

