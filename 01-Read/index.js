import express from "express";
import pg from "pg";

const PORT = 3000;

const app = express();

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// create a DB client
const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "world",
});

// connect to DB
db.connect();

let quiz = [];

// query DB
db.query("SELECT * from capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    // get all rows
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect = 0;

app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

let currentQuestion = {};

async function nextQuestion() {
  currentQuestion = quiz[Math.floor(Math.random() * quiz.length)];
}

app.post("/submit", (req, res) => {
  const answer = req.body["answer"].trim(); // trim the spaces
  let isCorrect = false;
  // case insensitive comparison
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }
  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});
