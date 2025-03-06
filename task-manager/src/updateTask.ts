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
        'id': updatedTask.id,
        'title': updatedTask.title,
        'description': updatedTask.description,
        'dueDate': updatedTask.dueDate
      })
    })

    const data = await response.json();

    console.log("data: ", data);

    if(!response.ok) {
      // The server sent back a description of the error.
      throw new Error(`Server error: ${data.error}`);
    }

    return data;
  } catch(error) {
    // Throw the error to trigger the onError callback.
    throw error;
  }
};