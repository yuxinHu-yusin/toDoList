import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 4000;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.database_user,
  host: process.env.database_host,
  database: process.env.database_name,
  password: process.env.database_password,
  port: process.env.database_port,
});
db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function checkItems(){
  const sql = "SELECT * FROM items";
  const result = await db.query(sql);
  items = result.rows;
}

app.get("/", async (req, res) => {
  await checkItems();
  // console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  // items.push({ title: item });
  const sql = "INSERT INTO items (title) VALUES ($1)";
  db.query(sql, [item]);
  res.redirect("/");
});

app.post("/edit", (req, res) => {
  const updatedID = req.body.updatedItemId;
  const updatedTITLE = req.body.updatedItemTitle;
  
  const sql = "UPDATE items SET title = ($1) WHERE id = ($2);";
  db.query(sql, [updatedTITLE, updatedID]);
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const deleteID = req.body.deleteItemId;

  const sql = "DELETE FROM items WHERE id = ($1)";
  db.query(sql, [deleteID]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
