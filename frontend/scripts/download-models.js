import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FURNITURE_CATALOG = [
  {
    name: "sofa",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
  },
  {
    name: "table",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
  },
  {
    name: "chair",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
  },
  {
    name: "bed",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
  },
  {
    name: "cabinet",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
  },
];

const MODELS_DIR = path.join(__dirname, "..", "public", "models");

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(MODELS_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ${filename}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if download failed
        reject(err);
      });

    file.on("error", (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

async function downloadAllModels() {
  console.log("Starting model downloads...");
  console.log("Models will be saved to:", MODELS_DIR);

  for (const furniture of FURNITURE_CATALOG) {
    const filename = `${furniture.name}.glb`;
    console.log(`Downloading ${furniture.name} from ${furniture.url}...`);
    try {
      await downloadFile(furniture.url, filename);
    } catch (error) {
      console.error(`Error downloading ${furniture.name}:`, error.message);
    }
  }

  console.log("Finished downloading models");
}

downloadAllModels();
