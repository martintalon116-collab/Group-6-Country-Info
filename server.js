require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/countries", (req, res) => {
  res.json(db.read());
});

app.post("/api/countries", (req, res) => {
  const countries = db.read();
  const countryItem = { id: Date.now(), ...req.body };
  countries.push(countryItem);
  db.write(countries);
  res.json(countryItem);
});

app.put("/api/countries/:id", (req, res) => {
  const countries = db.read();
  const countryItem = countries.find((c) => c.id == req.params.id);
  if (countryItem) {
    Object.assign(countryItem, req.body);
    db.write(countries);
    res.json(countryItem);
  } else {
    res.status(404).json({ error: "Country not found" });
  }
});

app.delete("/api/countries/:id", (req, res) => {
  const countries = db.read().filter((c) => c.id != req.params.id);
  db.write(countries);
  res.json({ message: "Country deleted" });
});

app.get("/api/lookup", async (req, res) => {
  const { name } = req.query;

  const apiKey = process.env.REST_API_KEY;

  let results = [];

  try {
    const response = await axios.get(
      "https://api.restcountries.com/countries/v5",
      {
        params: {
          q: name,
          pretty: 1,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    results = response.data.data.objects.map((countryData) => ({
      country: countryData.names?.official || "Unknown",
      capital: countryData.capitals?.[0]?.name || "Unknown",
      language: countryData.languages?.[0]?.name || "Unknown",
      currency: countryData.currencies?.[0]
        ? `${countryData.currencies[0].name} (${countryData.currencies[0].symbol || ""})`
        : "Unknown",
      notes: countryData.descriptions?.long || "Unknown",
    }));

    res.json(results);
  } catch (error) {
    res.json(results);
    return;
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
