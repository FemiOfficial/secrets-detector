import os from "os";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as tar from "tar";

// Gitleaks version to download
const GITLEAKS_VERSION = "8.18.2";
const GITLEAKS_BASE_URL = `https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}`;

const BIN_PATH = path.join(__dirname, ".bin");

function getPlatformMapping() {
  const platform = os.platform();
  const arch = os.arch();

  const mappings = {
    "darwin-x64": "darwin_x64",
    "darwin-arm64": "darwin_arm64",
    "linux-x64": "linux_x64",
    "linux-arm64": "linux_arm64",
    "win32-x64": "windows_x64",
  };

  const key = `${platform}-${arch}`;
  if (!mappings[key]) {
    throw new Error(`Unsupported platform: ${key}`);
  }

  const ext = platform === "win32" ? "zip" : "tar.gz";
  const binaryName = `gitleaks_${GITLEAKS_VERSION}_${mappings[key]}.${ext}`;

  return { url: `${GITLEAKS_BASE_URL}/${binaryName}`, ext };
}

async function downloadAndExtract() {
  const binaryPath = path.join(
    BIN_PATH,
    os.platform() === "win32" ? "gitleaks.exe" : "gitleaks"
  );
  if (fs.existsSync(binaryPath)) {
    console.log("✅ Gitleaks binary already exists in node_modules.");
    // Make sure it's executable
    fs.chmodSync(binaryPath, 0o755);
    return;
  }

  const { url } = getPlatformMapping();
  console.log(`🔽 Downloading Gitleaks to ${BIN_PATH}`);

  if (!fs.existsSync(BIN_PATH)) {
    fs.mkdirSync(BIN_PATH, { recursive: true });
  }

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    await new Promise<void>((resolve, reject) => {
      const stream = response.data.pipe(
        tar.x({
          strip: 0,
          C: BIN_PATH,
        })
      );
      stream.on("finish", () => {
        // Make sure the binary is executable after extraction
        fs.chmodSync(binaryPath, 0o755);
        console.log(`✅ Gitleaks downloaded and extracted to ${BIN_PATH}`);
        resolve();
      });
      stream.on("error", reject);
    });
  } catch (error) {
    console.log(error);
    console.error(`❌ Failed to download Gitleaks: ${error.message}`);
    process.exit(1);
  }
}

downloadAndExtract();
