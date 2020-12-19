// Подключение библиотек
const sql = require('mssql');
const express = require("express");
const app = express();
 
app.use(express.static(__dirname));

const host = '0.0.0.0';
const port = 8080;

app.get("/api/Flower/", async function(request, response){
    response.setHeader("Content-Type", "text/json; charset=utf-8;");
    await sql.connect('mssql://SA:Dashadasha12@localhost/VenusDB');
    const id = request.query.id;

    if (id){
        let flower = (await sql.query`select * from Flowers where id = ${id}`).recordset.pop();
        if (flower){
            let stat = (await sql.query`select * from FlowerStatistics where id = ${id}`).recordset.pop();
            if (stat){
                await sql.query`update FlowerStatistics set count = count + 1 where id = ${id}`;
            } else {
                await sql.query`insert into FlowerStatistics(id, count) values(${id}, 1)`;
            }
            response.end(JSON.stringify(flower));
        }
    }
    
    sql.close();
});

app.get("/api/Statistics/", async function(request, response){
    response.setHeader('Content-Type', 'text/json; charset=utf-8');
    await sql.connect('mssql://SA:Dashadasha12@localhost/VenusDB');
    let statistics = (await sql.query`select f.name, fs.count from FlowerStatistics fs join Flowers f on fs.id = f.id`).recordset;
    response.end(JSON.stringify(statistics));
    sql.close();
});

app.listen(port, host);

console.log(`Started at http://${host}:${port}/`);
