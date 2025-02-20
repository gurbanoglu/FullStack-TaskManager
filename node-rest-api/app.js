import express from 'express';
import { db } from './database.js';
import bodyParser from 'body-parser';

/*Restart the local development server
  after making changes.*/

// To access environment variables in the .env file.
import 'dotenv/config';

// Generate a server.
const app = express();

/*Assume the data being sent to the server is
  JSON and use bodyParser to read and convert
  the JSON string into a JavaScript object.*/
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.log('ERROR:', err.message);
  }

  console.log(`Server listening on port ${PORT}.`);
});

app.get('/get-tasks', (request, response) => {
  console.log('/get-tasks');

  response.set('content-type', 'application/json');

  let data = {tasks: []};

  try {
    const stmt = db.prepare('SELECT * FROM tasks');

    for (const task of stmt.iterate()) {
      data.tasks.push({id: task.id, title: task.title,
        description: task.description, dueDate: task.dueDate,
        isComplete: task.isComplete});
    }

    let content = JSON.stringify(data);
    response.send(content);
  }catch(err) {
    /*Catch the error, so that the
      application doesn't crash.*/
    console.log(err.message);

    // Indicates a problem with the data.
    response.status(467);

    response.send(`{"code":467, "status":"${err.message}"}`);
  }
});

app.post('/create-task', (req, res) => {
  console.log('/create-task');

  // console.log(req.body);

  res.set('content-type', 'application/json');

  try {
    const stmt = db.prepare('INSERT INTO tasks(title, description, dueDate, isComplete) VALUES (?, ?, ?, ?)');

    const info = stmt.run(req.body.title, req.body.description, req.body.dueDate, req.body.isComplete);

    res.status(201);

    let data = {
      status: 201,
      message: `Task ${info.lastInsertRowid} saved.`,
      id: info.lastInsertRowid
    };

    let content = JSON.stringify(data);
    res.send(content);
  }catch(err) {
    console.log(err.message);

    res.status(468);

    res.send(`{"code":468, "status":"${err.message}"}`);
  }
});

// Partial update
app.patch('/mark-task-complete', (req, res) => {
  console.log('/update-task');

  res.set('content-type', 'application/json');

  const rowToPartiallyUpdate = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.query.id);

  try {
    const stmt = db.prepare(`
      UPDATE tasks
      SET isComplete=?
      WHERE id=?`);

    if (rowToPartiallyUpdate.isComplete == 0) {
      rowToPartiallyUpdate.isComplete = 1;
    }else{
      rowToPartiallyUpdate.isComplete = 0;
    }

    const info = stmt.run(
      rowToPartiallyUpdate.isComplete,
      req.query.id
    );

    if(info.changes === 1) {
      res.status(200);
      res.send(`{"message":"Task ${req.query.id} was updated."}`);
    }
  }catch(err) {
    console.log(err.message);
    res.status(468);
    res.send(`{"code":468, "status":"${err.message}"}`);
  }
});

app.put('/update-task', (req, res) => {
  console.log('/update-task');

  res.set('content-type', 'application/json');

  try {
    const stmt = db.prepare(`
      UPDATE tasks
      SET title=?, description=?, dueDate=?
      WHERE id=?`);

    console.log('req.body.dueDate:', req.body.dueDate)

    const info = stmt.run(req.body.title, req.body.description, req.body.dueDate, req.query.id);

    if(info.changes === 1) {
      res.status(200);
      res.send(`{"message":"Task ${req.query.id} was updated."}`);
    }else{
      res.status(200);
      res.send(`{"message":"No operation needed."}`);
    }
  }catch(err) {
    console.log(err.message);
    res.status(468);
    res.send(`{"code":468, "status":"${err.message}"}`);
  }
});

app.delete('/delete-task', (req, res) => {
  console.log('/delete-task');

  res.set('content-type', 'application/json');

  try {
    const stmt = db.prepare('DELETE FROM tasks WHERE id=?');

    const info = stmt.run(req.query.id);

    if(info.changes === 1) {
      res.status(200);
      res.send(`{"message":"Task ${req.query.id} was deleted."}`);
    }else{
      res.status(200);
      res.send(`{"message":"No operation needed."}`);
    }
  }catch(err) {
    console.log(err.message);
    res.status(468);
    res.send(`{"code":468, "status":"${err.message}"}`);
  }
});