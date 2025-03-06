import express from 'express';
import { db } from './database.js';
import bodyParser from 'body-parser';

/* Restart the local development server
   after making changes. */

// To access environment variables in the .env file.
import 'dotenv/config';
import { isValid, isPast } from 'date-fns';

// Generate a server.
const app = express();

/* Assume the data being sent to the server is
   JSON and use bodyParser to read and convert
   the JSON string into a JavaScript object. */
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.log('In app.listen err.message:', err.message);
  }

  console.log(`Server listening on port ${PORT}.`);
});

// Global error handler.
const errorHandler = (err, req, res, next) => {
  console.error(`In errorHandler err.message: ${JSON.stringify(err.message)}`);

  if (res.headersSent) {
    return next(err);
  }

  // Default to internal server error
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof Error && err.message.includes("SQLITE_ERROR")) {
    statusCode = 500;
    message = "Database operation failed.";
  } else if (err.status === 400) {
    statusCode = 400;
    message = err.message || "Bad Request";
  } else if (err.status === 404) {
    statusCode = 404;
    message = err.message || "Not Found";
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

app.use(errorHandler);

app.get('/get-tasks', (req, res) => {
  console.log('/get-tasks');

  let data = {tasks: []};

  const stmt = db.prepare('SELECT * FROM tasks');

  for (const task of stmt.iterate()) {
    data.tasks.push({id: task.id, title: task.title,
      description: task.description, dueDate: task.dueDate,
      isComplete: task.isComplete});
  }

  res.json(data);
});

/* Verify whether the inputted title for the task
   already exists in one of the records/rows in
   the database table. */
const titleIsDuplicate = async (originalTitle, inputtedTitle) => {
  // Check if the inputted title matches the
  // title of the task being edited.
  if(inputtedTitle === originalTitle) {
    return false;
  }

  const stmt = db.prepare(`
    SELECT CASE
      WHEN EXISTS (
        SELECT 1
        FROM tasks
        WHERE title=?
      ) THEN TRUE
      ELSE FALSE
    END AS Result`
  );

  /* Use stmt.get() when you want to retrieve data
     from a SELECT query.

     stmt.run() is typically used for INSERT, UPDATE,
     or DELETE operations where you don't need to
     retrieve data. */
  const info = stmt.get(inputtedTitle);

  return info["Result"];
}

const titleIsInvalid = async (originalTitle, inputtedTitle) => {
  const duplicateTitle = await titleIsDuplicate(originalTitle, inputtedTitle);

  if(typeof inputtedTitle !== "string") {
    console.log("Inputted title was not of the string data type.");
    return true;
  }
  else if(duplicateTitle) {
    console.log('Inputted title is a duplicate.');
    return true;
  }else if(inputtedTitle.length > 50) {
    console.log('Inputted title exceeds fifty characters.');
    return true;
  }else{
    return false;
  }
}

const descriptionIsInvalid = (inputtedDescription) => {
  if(typeof inputtedDescription !== "string") {
    console.log("Inputted description was not of the string data type.");
    return true;
  }
  else if(inputtedDescription.length > 500) {
    console.log("Inputted description exceeds five hundred characters.");
    return true;
  }else{
    return false;
  }
}

const dateIsInvalid = (inputtedDate) => {
  if(!isValid(new Date(inputtedDate)) || isPast(inputtedDate)) {
    return true;
  }else{
    return false;
  }
}

const validateInput = async (
  originalTitle, title, description, dueDate
) => {
  if (await titleIsInvalid(originalTitle, title)) {
    return [true, "Invalid title inputted."];
  }else if(descriptionIsInvalid(description)) {
    return [true, "Invalid description inputted."];
  }else if(dateIsInvalid(dueDate)) {
    return [true, "Invalid due date inputted."];
  }else{
    return [false, ""];
  }
}

app.post('/create-task', async (req, res) => {
  console.log('/create-task');

  const result = await validateInput(
    '',
    req.body.title,
    req.body.description,
    req.body.dueDate
  );

  const inputIsInvalid = result[0];

  const errMsg = result[1];

  if(inputIsInvalid){
    res.status(400).json({ error: errMsg });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO tasks(title, description, dueDate, isComplete)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    req.body.title, req.body.description,
    req.body.dueDate, req.body.isComplete
  );

  let data = {
    message: `Task ${info.lastInsertRowid} saved.`,
    id: info.lastInsertRowid
  };

  res.json(data);
});

// Partial update
app.patch('/mark-task-complete', (req, res) => {
  console.log('/mark-task-complete');

  const rowToPartiallyUpdate = db.prepare(
    'SELECT * FROM tasks WHERE id=?').get(req.query.id);

  if (rowToPartiallyUpdate.isComplete == 0) {
    rowToPartiallyUpdate.isComplete = 1;
  }else{
    rowToPartiallyUpdate.isComplete = 0;
  }

  const stmt = db.prepare(`
    UPDATE tasks
    SET isComplete=?
    WHERE id=?`);

  const info = stmt.run(
    rowToPartiallyUpdate.isComplete,
    req.query.id
  );

  if(info.changes === 1) {
    res.json(`{"message": "Task ${req.query.id} was updated."}`);
  }
});

// Potentially all the fields for
// a task object can be updated.
app.put('/update-task', async (req, res) => {
  console.log('/update-task');

  const stmt1 = db.prepare(`
    SELECT title
    FROM tasks
    WHERE id=?;`);

  const titleOfEditedTask = stmt1.get(req.body.id);

  const result = await validateInput(
    titleOfEditedTask['title'],
    req.body.title,
    req.body.description,
    req.body.dueDate
  );

  const inputIsInvalid = result[0];

  const errMsg = result[1];

  if(inputIsInvalid){
    res.status(400).json({ error: errMsg });
    return;
  }

  const stmt2 = db.prepare(`
    UPDATE tasks
    SET title=?, description=?, dueDate=?
    WHERE id=?`);

  const info = stmt2.run(req.body.title, req.body.description, req.body.dueDate, req.query.id);

  if(info.changes === 1) {
    res.json(`{"message": "Task ${req.query.id} was updated."}`);
  }else{
    res.json(`{"message": "No operation needed."}`);
  }
});

app.delete('/delete-task', (req, res) => {
  console.log('/delete-task');

  const stmt = db.prepare('DELETE FROM tasks WHERE id=?');

  const info = stmt.run(req.query.id);

  if(info.changes === 1) {
    res.json(`{"message": "Task ${req.query.id} was deleted."}`);
  }else{
    res.json(`{"message": "No operation needed."}`);
  }
});