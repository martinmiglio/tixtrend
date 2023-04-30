const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const directories = [
  "../tixtrend-event-pricing",
  "../tixtrend-event-watch",
  "../tixtrend-poll-prices",
  "../tixtrend-queue-watched-events",
];

const out_dir = path.join(__dirname, "/../temp/archives/");

if (!fs.existsSync(out_dir)) {
  fs.mkdirSync(out_dir, { recursive: true });
}

directories.forEach((rel_dir) => {
  const dir = path.join(__dirname, rel_dir);

  // create a file to stream archive data to.
  const out_file_name = rel_dir.split("/")[1] + ".zip";
  const out_file = path.join(out_dir, out_file_name);

  if (fs.existsSync(out_file)) {
    fs.unlinkSync(out_file);
  }

  const output = fs.createWriteStream(out_file);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on("close", () => {
    console.log(
      `Archived ${dir} to ${out_file_name} with ${archive.pointer()} total bytes`
    );
    console.log(`\tFiles: ${fs.readdirSync(dir)}`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  archive.directory(dir, false);

  archive.finalize();
});
