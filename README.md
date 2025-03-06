Navigate to the frontend ReactJS application:
cd FullStack/TaskManager/task-manager

Execute the following to launch the local
development server:
npm run dev

Navigate to the backend Express application:
cd FullStack/TaskManager/node-rest-api

Execute the following to launch the local
development server:
node app.js

Build command to run in the client-side and
server-side directories:
npm i

Remember that Git pushes should only be executed
in the "Task Manager" directory since that is
where the Git repository was initialised.

Delete the node_modules directory in both the
ReactJS and Express projects before deploying
each of them to Render.

For the "Build Command" input field in the Render
configuration settings, put "dist" (without the quotes)
because when executing the command "npm run build"
in the "task-manager" directory, the "dist" folder
is generated.

Remember not to push the node-rest-api/.env file to
the GitHub repository because environment variables
store confidential/sensitive data.

I noticed that even after successfully deploying the
backend Express application, the link to access it
shows:
Cannot GET /

GET https://taskmanager-ar4b.onrender.com/ 404 (Not Found)

Input for title, description, and dueDate was validated
in the Express application because an HTTP request from
outside of the ReactJS application can come in.