import { Task } from './TaskComponent';

export const updateTask = async ( updatedTask: Task ) => {
  try {
    const response = await fetch(`/api/update-task/?id=${updatedTask.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        'title': updatedTask.title,
        'description': updatedTask.description,
        'dueDate': updatedTask.dueDate
      })
    })

    const data = await response.json();

    console.log("data: ", data);

    if(!response.ok) {
      // The server sent back a description of the error.
      console.log(data.description);
      return;
    }

    return data;
  } catch(error) {
    console.log(error);
  }
};