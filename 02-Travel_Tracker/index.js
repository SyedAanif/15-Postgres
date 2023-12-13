import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "world",
});

db.connect();

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let country_codes = [];
  result.rows.forEach((country) => {
    country_codes.push(country.country_code);
  });

  return country_codes;
}

app.get("/", async (req, res) => {
  const country_codes = await checkVisited();
  //   console.log(country_codes);
  res.render("index.ejs", {
    countries: country_codes,
    total: country_codes.length,
  });
  //   db.end();
});

app.post("/add", async (req, res) => {
  const userAddedCountry = req.body["country"];

  try {
    // using place-holders
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [userAddedCountry.toLowerCase()]
    );
    // console.log(result);
    const data = result.rows[0];

    const country_code = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [country_code]
      );

      res.redirect("/");
      // Insert block try-catch
    } catch (error) {
      errroHandler("Country has already been added, try again!", res);
    }

    //   Select query try-catch
  } catch (error) {
    errroHandler("Country name doesn't exist, try again!", res);
  }
});

async function errroHandler(errMessage, res) {
  const country_codes = await checkVisited();
  res.render("index.ejs", {
    countries: country_codes,
    total: country_codes.length,
    error: errMessage,
  });
}
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
