import express, { Express, Request, Response } from "express";
import { Database } from "sqlite3";
import fs from "fs";

const app: Express = express();
const port = 8080;

app.use(express.json());

// Open a SQLite database, stored in the file db.sqlite
const db = new Database("db.sqlite");

// Read and execute the SQL query in ./kanban.sql
db.exec(fs.readFileSync("./kanban.sql").toString());

app.post("/boards", (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).send({ err: "title is required" });
    db.run(
      `INSERT INTO kanban(title, stage) VALUES(?, ?)`,
      [title, 1],
      function (err) {
        // if (err) {
        //   console.log(err.message);
        // }
        db.get(`SELECT * FROM kanban where id=${this.lastID}`, (err, row) => {
          res.status(201).send(row);
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ err: "Something went wromg" });
  }
});

app.put("/boards/:id", (req: Request, res: Response) => {
  try {
    const { stage } = req.body;
    const { id } = req.params;

    if (!stage) return res.status(400).send({ err: "stage is required" });

    const dataStage = Number(stage);

    if (dataStage === 1 || dataStage === 2 || dataStage === 3) {
      db.run(
        `UPDATE kanban SET stage = ? WHERE id = ?`,
        [dataStage, id],
        function (err) {
          //   if (err) {
          //     console.error(err.message);
          //   }

          db.get(`SELECT * FROM kanban where id=${id}`, (err, row) => {
            res.status(200).json(row);
          });
        }
      );
    } else {
      res.status(400).send({ err: "No Requirement" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ err: "Something went wromg" });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
