require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");

const API_KEY = process.env.TICKET_TAILOR_API_KEY;
const BASE_URL = "https://api.tickettailor.com/v1/discounts";

if (!API_KEY) {
  console.error("❌ Missing API key in .env file");
  process.exit(1);
}

const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

async function createDiscount(payload) {
  try {
    console.log("\n📤 Sending:", payload);

    const response = await axios.post(
      "https://api.tickettailor.com/v1/discounts",
      { data: payload }, // 👈 THIS IS THE FIX
      {
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Created: ${payload.code}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed: ${payload.code}`);
    console.error(error.response?.data || error.message);
  }
}


function processCSV(filePath) {
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      console.log(`\nFound ${rows.length} discounts to create...\n`);

      for (const row of rows) {
        const cleanType = row.discount_type?.trim().toLowerCase();
        const cleanCode = row.code?.trim();

        if (!cleanCode || !cleanType) {
          console.log("⚠️ Skipping invalid row:", row);
          continue;
        }

        const payload = {
          code: cleanCode,
          type:
            cleanType === "percentage"
              ? "percentage"
              : "fixed_amount",
        };

        if (cleanType === "percentage") {
          payload.price_percent = Number(row.discount_value);
        } else if (cleanType === "fixed") {
          payload.price = Number(row.discount_value) * 100; // convert to cents
        } else {
          console.log(`⚠️ Invalid discount_type for ${cleanCode}`);
          continue;
        }

        if (row.max_redemptions) {
          payload.max_redemptions = Number(row.max_redemptions);
        }

        if (row.ticket_type_ids && row.ticket_type_ids.trim() !== "") {
          payload.ticket_types = row.ticket_type_ids
            .split(",")
            .map((id) => id.trim());
        }

        console.log(payload);

        await createDiscount(payload);
      }

      console.log("\n🎉 Finished processing all discounts.\n");
    });
}

processCSV("discounts.csv");
