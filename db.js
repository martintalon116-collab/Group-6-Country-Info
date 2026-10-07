const fs = require("fs");
const FILE = "countries.json";

// Make the file with an empty list if it is not there yet.
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

// Read all data, and save all data.
exports.read = () => JSON.parse(fs.readFileSync(FILE));
exports.write = (countries) =>
  fs.writeFileSync(FILE, JSON.stringify(countries, null, 2));
