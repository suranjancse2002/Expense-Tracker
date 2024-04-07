import express from "express";
import bodyParser from "body-parser";
import path, { format } from 'path';
import { fileURLToPath } from 'url';
import pg from "pg"
import fileUpload from "express-fileupload";
import env from "dotenv"
import cors from 'cors'


// Enable CORS for all routes

const app = express();
const port = 5500;
const saltRounds = 10;
env.config()

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.use(fileUpload());

const db = new pg.Client({
    user: process.env.SESSION_USER,
    host: process.env.SESSION_HOST,
    database: process.env.SESSION_DATABASE,
    password: process.env.SESSION_PASSWORD,
    port: process.env.SESSION_PORT,
});

db.connect();

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/:id/filter", async (req, res) =>{
    const userId = req.params.id;
    const tag = req.query.type;
    const data = await db.query("SELECT * FROM expenses WHERE user_id = $1 AND tag = $2 ORDER BY id ASC", [userId, tag])
    res.json(data.rows);
})

app.get("/:id", async (req, res) =>{
    const userId = req.params.id;
    const date = new Date();
    const currMonth = date.getMonth() + 1;
    const data = await db.query("SELECT * FROM expenses WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 ORDER BY id ASC", [userId, currMonth])
    res.json(data.rows);
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

