import { newTask } from './TaskComponent'

export const createTask = async ( newTask: newTask ) => {
  try {
    const response = await fetch('/api/create-task/', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        'title': newTask.title,
        'description': newTask.description,
        'dueDate': newTask.dueDate,
        'isComplete': 0
      })
    })

    const data = await response.json();

    console.log("data: ", data);

    if(!response.ok) {
      // The server has sent back a description of the error.
      console.log(data.description);
      return;
    }

    return data;
  } catch(error) {
    console.log(error);
  }
};