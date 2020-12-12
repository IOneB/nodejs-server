const sql = require('mssql');
const http = require('http');
const fs = require('fs');

const host = '0.0.0.0';
const port = 8080;

const routes = [
    {
        route: 'Flower', action: async function (id) {
            this.setHeader("Content-Type", "text/json; charset=utf-8;");
            await sql.connect('mssql://SA:Dashadasha12@localhost/VenusDB');
            
            if (id){
                let flower = (await sql.query`select * from Flowers where id = ${id}`).recordset.pop();
                if (flower){
                    let stat = (await sql.query`select * from FlowerStatistics where id = ${id}`).recordset.pop();
                    if (stat){
                        await sql.query`update FlowerStatistics set count = count + 1 where id = ${id}`;
                    } else {
                        await sql.query`insert into FlowerStatistics values(1)`;
                    }
                    this.end(JSON.stringify(flower));
                }
            }
            sql.close();
        }
    },
    {
        route: 'Statistics', action: async function(){
            this.setHeader('Content-Type', 'text/json; charset=utf-8');
            await sql.connect('mssql://SA:Dashadasha12@localhost/VenusDB');
            let statistics = (await sql.query`select * from FlowerStatistics`).recordset;
            this.end(JSON.stringify(statistics));
            sql.close();
        }
    }
];

function getApi(resp, path) {
    const params = path.searchParams;
    const id = params.has('id') ? params.get('id') : null;
    var route = routes.find(x => (path.pathname.trimEnd('/') + '/') === `/api/${x.route}/`);

    if (route) {
        route.action.call(resp, id);
    }
    else {
        resp.statusCode = 404;
        resp.end('Указанный ресурс не найден');
    }
}

function getFile(resp, path) {
    let fileName = '.' + path.pathname;
    if (fileName === './') fileName = './index.html';

    var s = fs.createReadStream(fileName);
    s.on('open', function () {
        s.pipe(resp);
    });
}

http.createServer((req, resp) => {
    resp.setHeader("Content-Type", "text/html; charset=utf-8;");
    const path = new URL(`http://${host}:${port}${req.url}`);

    if (path.pathname.startsWith('/api/')) {
        getApi(resp, path);
    }
    else {
        getFile(resp, path);
    }
}).listen(port, host);

console.log(`Started at http://${host}:${port}/`);