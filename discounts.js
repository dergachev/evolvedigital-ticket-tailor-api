require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");

const API_KEY = process.env.TICKET_TAILOR_API_KEY;
const BASE_URL = "https://api.tickettailor.com/v1";

if (!API_KEY) {
  console.error("Missing API key. Add it to .env file.");
  process.exit(1);
}

async function createDiscount(discount) {
  try {
    const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

    const response = await axios.post(
      `${BASE_URL}/discounts`,
      discount,
      {
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ Created: ${discount.code}`);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Failed: ${discount.code}`,
      error.response?.data || error.message
    );
  }
}


function parseCSVAndCreateDiscounts(filePath) {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", async () => {
      console.log(`Found ${results.length} discounts to create...`);

      for (const row of results) {
      const discountPayload = {
code: row.code,
type: row.discount_type === "percentage" ? "percentage" : "fixed_amount",
// amount fields — different depending on type
price_percent: row.discount_type === "percentage" ? Number(row.discount_value) : null,
price: row.discount_type === "fixed" ? Number(row.discount_value) * 100 : null,
max_redemptions: Number(row.max_redemptions) || null,
// ticket type IDs as array
ticket_types: row.ticket_type_ids
? row.ticket_type_ids.split(",").map((id) => id.trim())
: [],
};

console.log(discountPayload);

await createDiscount(discountPayload);
}

      console.log("Done processing all discounts.");
    });
}

parseCSVAndCreateDiscounts("discounts.csv");

