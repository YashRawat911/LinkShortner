let express = require("express")
let app = express()
let crypto = require("crypto")
const db = require('better-sqlite3')('db.sqlite')
let config = require("./config")

app.set('view engine', 'ejs')
app.listen(config.port, () => {
    console.log("Started LinkShortner On Port " + config.port)
})

app.get("/link:code", async (req,res) => {
    let link = await get("links-" + req.params.code)
    res.status(301).redirect(link)
})

app.get("/short", async (req,res) => {
    if (!req.query.link) return

    if (req.query.link.indexOf('http://') === 0 || req.query.link.indexOf('https://') === 0) {
        const code = crypto.randomBytes(8).toString("hex");
    await set("links-" + code, req.query.link)
    res.send(`your link has been shortened to ${config.domain}${(config.port == 80) ? '': ":" + config.port}/link${code}`)
    } else {
        res.send("only absolute url's are supported")
    }
    
})

app.get("/", async (req,res) => {
    res.render("index.ejs")
})
db.prepare(`CREATE TABLE IF NOT EXISTS "Links" ("name" PRIMARY KEY, "value" TEXT)`).run();


async function get(name) {
        let row = await db.prepare('SELECT * FROM Links WHERE name = ?').get(`Links:${name}`);

        return row ? JSON.parse(row.value).value : undefined;
}

async function set(name, value) {

        await db.prepare('INSERT INTO Links (name, value) VALUES (?, ?)').run(`Links:${name}`, JSON.stringify({
            value: value,
        }));

        return true;
}
