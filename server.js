import express from 'express';
import fs from 'fs/promises';
import Datastore from 'nedb';
import bodyParser from 'body-parser';
import faker from 'faker';
const port = process.env.PORT || 3000;

const server = express();
server.use(bodyParser.json());


const db = new Datastore({ filename: 'database.db', autoload: true });
//#region Первоначальная загрузка данных в БД
//db.remove({}, { multi: true }, function (err, numRemoved) { });
// for (let i = 0; i < 10; i++) {
//     const student = {
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName(),
//         email: faker.internet.email(),
//         age: Math.floor(Math.random() * 10 + 18)
//     };
//     db.insert(student, (err, newDoc) => {

//     });
// };
//#endregion Первоначальная загрузка данных в БД
server.get('/', async (req, res) => {
    const indexPage = await fs.readFile('./index.html');
    res.send(indexPage.toString());
});

server.get('/api/students', async (req, res) => {
    db.find({}, ((err, records) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.send(records);
        }
    }));
});


function fetchStudent(req, res) {
    db.findOne({ _id: req.params.id }, function (err, record) {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (!record) {
            res.status(404).json({ error: 'Not found' });
        } else {
            res.send(record);
        }
    });

}

server.get('/api/student/:id', (req, res) => {
    fetchStudent(req, res);
});

server.patch('/api/student/:id', (req, res) => {
    db.update({ _id: req.params.id }, { $set: req.body }, function (err) {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    fetchStudent(req, res);
});

server.delete('/api/student/:id', (req, res) => {
    db.remove({ _id: req.params.id }, {}, function (err) {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    res.send({ Deleted: req.params.id });
});

server.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});