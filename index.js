import express from "express";
import bodyParser from "body-parser";
import path, { format } from 'path';
import { fileURLToPath } from 'url';
import pg from "pg"
import fileUpload from "express-fileupload";
import puppeteer from 'puppeteer'
import bcrypt from "bcrypt"
import session, { Cookie } from "express-session"
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv"

const app = express();
const port = 3000;
const saltRounds = 10;
env.config()


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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))

//passport after session initializatiom
app.use(passport.initialize());
app.use(passport.session())


app.get("/inputform", async (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.user.id)
        res.render("inputform.ejs")
    }
    else {
        res.redirect('/login');
    }
})

app.post("/inputform", async (req, res) => {
    const amount = req.body.inputFormAmount;
    var date = req.body.inputFormDate;
    const dateObj = new Date(date);

    // Format the date using toLocaleDateString()
    const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    console.log(formattedDate);
    date = formattedDate
    const category = req.body.inputFormCategory;
    const desc = req.body.inputFormTextArea;
    const paymentMethod = req.body.inputFormPaymentMethod;
    const tag = req.body.inputFormTags;
    const userId = req.user.id;

    const { name, data } = req.files.inputFormFile;

    try {

        const query = "INSERT INTO expenses (amount, date, category, description, payment_method, tag, receipt_data, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

        const values = [
            amount,
            date,
            category,
            desc,
            paymentMethod,
            tag,
            data,
            userId,
        ]

        await db.query(query, values);
        console.log(`Record inserted successfully on ${date}`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error storing data:", error);
        res.status(500).send("Internal Server Error");
    }

})

app.get("/login", async (req, res) => {
    res.render("login.ejs")
})
app.get("/signup", async (req, res) => {
    res.render("signup.ejs")
})

app.post("/signup", async (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const username = req.body.username.trim();
    const chkResult = db.query("SELECT * FROM users WHERE email = $1", [email]);
    try {
        if ((await chkResult).rows.length == 0) {
            //hash the password before saving it to the database
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                }
                else {
                    db.query("INSERT INTO users (username,email, password) VALUES ($1,$2,$3) RETURNING *", [username, email, hash]);
                    const result = await db.query("SELECT (username,email, password) FROM  users WHERE email=$1", [email]);
                    console.log(result)
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log(err);
                        res.redirect("/login");
                    })
                }
            })

        }
        else {
            //I have to handle it by sending this info to the frontend
            console.log("You are already registered try logging in...")
        }
    } catch (error) {
        console.log(error)
    }
    // db.end();

});



// app.post("/budget", async (req, res) => {
//     const budgetAmount = req.body.inputBudget;
//     console.log(budgetAmount)
//     res.redirect("/dashboard")
// })

var updateId;
app.get("/update/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        updateId = id
        try {
            const data = await db.query(`SELECT * FROM expenses WHERE id = $1`, [id])
            console.log(data.rows[0]);
            res.render("update-expenses.ejs", {
                data: data.rows[0],
                id: id
            })
        } catch (error) {
            console.error('Failed to load dashboard', error);
            return res.status(500).json({ "message": 'Server error' });
        }
        // res.render("update-expenses.ejs")
    }
    else {
        res.render("/login")
    }

});

app.post("/updateexpense", async (req, res) => {
    if (req.isAuthenticated()) {
        console.log("Update id is : ", updateId)
        const userId = req.user.id;
        const amount = req.body.inputFormAmount;
        var date = req.body.inputFormDate;
        const dateObj = new Date(date);

        // Format the date using toLocaleDateString()
        const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // console.log(formattedDate);
        date = formattedDate
        const category = req.body.inputFormCategory;
        const desc = req.body.inputFormTextArea;
        const paymentMethod = req.body.inputFormPaymentMethod;
        const tag = req.body.inputFormTags;

        const { name, data } = req.files.inputFormFile;
        console.log(updateId, desc)

        // const datapresent = await db.query(`SELECT * FROM expenses WHERE id = ${updateId}`)
        // console.log(datapresent.rows[0])
        try {
            await db.query("UPDATE expenses SET amount = $1, date = $2, category = $3, description = $4, payment_method = $5, tag = $6, receipt_data = $7 WHERE id = $8", [amount, date, category, desc, paymentMethod, tag, data, updateId]);
            console.log(`Record updated successfully on ${date}`);
            res.redirect('/dashboard');
        } catch (error) {
            console.error("Error storing data:", error);
            res.status(500).send("Internal Server Error");
        }
    }
    else {
        res.render("/login")
    }

    // res.send("Hello")
})

// //Design for downloadable page
app.get("/monthly-report/:id", async (req, res) => {
    // if(req.isAuthenticated()){
    const userId = req.params.id;
    const userExpense = await (await db.query("SELECT * from expenses WHERE user_id = $1 ORDER BY id ASC", [userId])).rows
    const bio = await (db.query("SELECT * FROM users where id = $1", [userId]))
    res.render("monthly-report.ejs", {
        userExpense: userExpense,
        bio: bio.rows[0],
    })
    // }
    // else{
    // res.redirect("/login")
    // }

})

// //This is for downloading purpose
app.get("/monthly-report-download/:id", async (req, res) => {
    // if (req.isAuthenticated()) {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage();
        await page.goto(`${req.protocol}://${req.get('host')}` + "/monthly-report/" + req.params.id, {
            waitUntil: "networkidle2"
        })

        await page.setViewport({ width: 1680, height: 1050 })

        const todayDate = new Date();

        const newpdf = await page.pdf({
            path: `${path.join(__dirname, './public/files', todayDate.getTime() + ".pdf")}`,
            format: "A4"
        })

        await browser.close();
        const pdfURL = path.join(__dirname, './public/files', todayDate.getTime() + ".pdf")

        // res.set({
        //     "Content-Type": "application/pdf",
        //     "Content-Length": newpdf.length
        // })

        // res.sendFile(pdfURL)

        res.download(pdfURL, (err) => {
            if (err) {
                console.log(err.message)
            }
        })

    } catch (error) {
        console.log(error)
    }
    // }
    // else{
    //     res.redirect("/login")
    // }
})

app.get("/image/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        const userId = req.user.id;
        try {
            const data = await db.query(`SELECT * FROM expenses WHERE id = $1 AND user_id = $2`, [id, userId])
            if (data) {
                res.end(data.rows[0].receipt_data)
            }
            // console.log(data.rows[0].receipt_data)

        } catch (error) {
            console.error('Failed to load dashboard', error);
            return res.status(500).json({ "message": 'Server error' });
        }
    }
    else {
        res.redirect("/login")
    }
})

app.get("/editprofile", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("edit-profile.ejs")
    }
    else {
        res.redirect("/login")
    }
})
app.post("/editprofile", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.id;
        const { name, data } = req.files.inputFormFile;
        const chkProfileImg = await db.query("SELECT * FROM users WHERE id = $1", [userId])
        if (chkProfileImg.rows.length > 0) {
            //update
            await db.query("UPDATE users SET profile_img = $1 WHERE id = $2", [data, userId])
        }
        else {
            await db.query("INSERT INTO users (profile_img) VALUES ($1) WHERE id = $2", [data, userId])
        }
        res.redirect("/dashboard")
    }
    else {
        res.redirect("/login")
    }
})

app.get("/profileimage", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.id;
        try {
            const data = await db.query(`SELECT * FROM users WHERE id = $1`, [userId])
            const avatar = await db.query("SELECT * FROM sampleimage")
            if (data.rows[0].profile_img) {
                res.end(data.rows[0].profile_img)
            }
            else {
                res.end(avatar.rows[0].sample_img)
            }
            // console.log(data.rows[0].receipt_data)

        } catch (error) {
            console.error('Failed to load dashboard', error);
            return res.status(500).json({ "message": 'Server error' });
        }
    }
    else {
        res.redirect("/login")
    }
})


app.get("/dashboard", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.id;
        console.log(userId)
        const date = new Date();
        const currMonth = date.getMonth() + 1;
        console.log(currMonth)
        const result = await db.query("SELECT * FROM  users WHERE id=$1", [userId]);
        const expenses = await db.query("SELECT * FROM  expenses WHERE user_id=$1 AND EXTRACT(MONTH FROM date) = $2 ORDER BY id ASC", [userId, currMonth]);
        const budget = await db.query("SELECT * FROM budget WHERE user_id = $1", [userId]);
        // console.log(result.rows[0].username)
        // console.log(expenses.rows);

        var totalExpense = 0;
        var percentage = 0;
        if (expenses.rows.length > 0 && budget.rows.length > 0) {
            expenses.rows.forEach(expense => {
                totalExpense += parseInt(expense.amount);
            })

            percentage = parseInt((totalExpense / parseInt(budget.rows[0].budget)) * 100);
        }


        res.render("dashboard.ejs", {
            username: result.rows[0],
            userExpense: expenses.rows,
            budget: budget.rows,
            percentage: percentage,
        });
    }
    else {
        res.redirect('/login');
    }

})

/

app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err){ 
            return next(err); 
        }
        res.redirect('/dashboard');
    });
});

app.get("/set-budget", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("set-budget.ejs");
    }
    else {
        res.redirect('/login');
    }

})

app.post("/set-budget", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.id;
        const budget = req.body.inputFormAmount;
        console.log(userId)
        const data = await db.query("SELECT * FROM  budget WHERE user_id=$1", [userId]);

        if (data.rows.length == 0) {
            //Insert data
            await db.query("INSERT INTO budget (budget, user_id) VALUES ($1, $2)", [budget, userId])
        }
        else {
            //Update data
            await db.query("UPDATE budget SET budget = $1 WHERE user_id = $2", [budget, userId]);
        }
        res.redirect("/dashboard");
    }
    else {
        res.redirect('/login');
    }
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const chkResult = db.query("SELECT * FROM users WHERE email = $1", [email]);
    try {
        if ((await chkResult).rows.length == 0) {
            //hash the password before saving it to the database
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                }
                else {
                    db.query("INSERT INTO users (email, password) VALUES ($1,$2) RETURNING *", [email, hash]);
                    const result = await db.query("SELECT (email, password) FROM  users WHERE email=$1", [email]);
                    console.log(result)
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log(err);
                        res.redirect("/login");
                    })
                }
            })

        }
        else {
            //I have to handle it by sending this info to the frontend
            console.log("You are already registered try logging in...")
        }
    } catch (error) {
        console.log(error)
    }
    // db.end();

});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}));

passport.use(new Strategy(async function verify(email, password, cb) {

    try {
        const checkResult = db.query("SELECT * FROM users WHERE email = $1", [email]);
        if ((await checkResult).rows.length > 0) {
            const user = (await checkResult).rows[0];
            const encryptedPassword = user.password;
            bcrypt.compare(password, encryptedPassword, (err, result) => {
                if (err) {
                    // console.log(err);
                    return cb(err);
                }
                else {
                    if (result) {
                        // res.render("secrets.ejs")
                        return cb(null, user);
                    }
                    else {
                        return cb(null, false);

                    }
                }
            })
        }
        else {
            return cb("User not found");
        }

    } catch (error) {
        return cb(error);
    }
}))

passport.serializeUser((user, cb) => {
    cb(null, user);
})

passport.deserializeUser((user, cb) => {
    cb(null, user);
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

