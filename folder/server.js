var sql = require('mssql/msnodesqlv8');
const http = require('http');
const fs = require('fs');

var sqlConfig = {
    server: '(localdb)\\MSSQLLocalDB',
    database: 'VenusDB',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};
const host = '0.0.0.0';
const port = 8080;

const routes = [
    {
        route: 'Flower', action: function (id) {
            this.setHeader("Content-Type", "text/json; charset=utf-8;");
            (async () => {
                await sql.connect(sqlConfig);
                let flower = (await sql.query`select * from Flowers where id = ${id}`).recordset.pop();

                this.end(JSON.stringify(flower));

                sql.close();
            })();
        }
    },
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