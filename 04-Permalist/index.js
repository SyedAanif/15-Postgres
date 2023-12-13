import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const PORT = 3000;

const app = express();

const db = new pg.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "permalist",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// READ
app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: result.rows,
  });
});

// CREATE
app.post("/add", async (req, res) => {
  const newItem = req.body["newItem"];
  await db.query("INSERT INTO items (title) VALUES ($1)", [newItem]);
  res.redirect("/");
});

// UPDATE
app.post("/edit", async (req, res) => {
  const updatedItemId = req.body["updatedItemId"];
  const updatedItemTitle = req.body["updatedItemTitle"];
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [
    updatedItemTitle,
    updatedItemId,
  ]);
  res.redirect("/");
});

// DELETE
app.post("/delete", async (req, res) => {
  const deleteItemId = req.body["deleteItemId"];
  await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
