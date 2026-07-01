import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("tests/fixtures", { recursive: true });

sharp({
  create: {
    width: 800,
    height: 600,
    channels: 3,
    background: { r: 100, g: 150, b: 200 },
  },
})
  .jpeg()
  .toFile("tests/fixtures/test-image.jpg")
  .then(() => console.log("Test image created"))
  .catch(console.error);
