#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const gitleaksBinary = path.resolve(__dirname, ".bin/gitleaks");

const libConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, ".gitleak.json"), "utf8")
);

export function loadProjectConfig() {
  const dedicatedConfigPath = path.join(projectRoot, ".gitleaks.json");
  const packageJsonPath = path.join(projectRoot, "package.json");

  let projectConfig = null;

  // 1. Look for a dedicated .gitleaks.json file
  if (fs.existsSync(dedicatedConfigPath)) {
    console.log("Found .gitleaks.json, extending default configuration.");
    projectConfig = JSON.parse(fs.readFileSync(dedicatedConfigPath, "utf8"));
  }
  // 2. Fallback to package.json
  else if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.gitleaksConfig) {
      console.log(
        'Found "gitleaksConfig" in package.json, extending default configuration.'
      );
      projectConfig = packageJson.gitleaksConfig;
    }
  }

  return projectConfig;
}

export function mergeConfigs(defaultConfig: any, projectConfig: any) {
  const mergedConfig = { ...defaultConfig };

  if (projectConfig) {
    // Merge exclusions
    if (projectConfig.exclude && Array.isArray(projectConfig.exclude)) {
      mergedConfig.exclude = [
        ...new Set([...defaultConfig.exclude, ...projectConfig.exclude]),
      ];
    }

    // Merge rules (project rules take precedence for same IDs)
    if (projectConfig.rules && Array.isArray(projectConfig.rules)) {
      // Add project rules, overwriting any with the same ID
      projectConfig.rules.forEach((projectRule: any) => {
        const existingIndex = defaultConfig.rules.findIndex(
          (rule: any) => rule.id === projectRule.id
        );
        if (existingIndex >= 0) {
          mergedConfig.rules[existingIndex] = projectRule;
        } else {
          mergedConfig.rules.push(projectRule);
        }
      });

      console.log(
        `🔎 Extended configuration with ${projectConfig.rules.length} custom rules.`
      );
    }
  }

  return mergedConfig;
}

export function createTempConfigFile(config: any): string {
  const tempConfigPath = path.join(projectRoot, ".gitleaks.temp.json");
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
  return tempConfigPath;
}

// Main execution
const projectConfig = loadProjectConfig();
const mergedConfig = mergeConfigs(libConfig, projectConfig);

let configFlags = "";

// Create temporary config file and use it
const tempConfigPath = createTempConfigFile(mergedConfig);
configFlags = `--config="${tempConfigPath}"`;

const command = `${gitleaksBinary} protect --staged --verbose ${configFlags}`;
console.log(`🚀 Running optimized Gitleaks scan...`);

try {
  execSync(command, { stdio: "inherit", cwd: projectRoot });
} catch (error) {
  console.error(
    "\n❌ Gitleaks detected potential secrets in staged changes! Commit aborted."
  );
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
  process.exit(1);
} finally {
  // Clean up temporary config file
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}
