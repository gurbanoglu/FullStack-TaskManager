export const markTaskComplete = async ( id: string ) => {
  try {
    const response = await fetch(`/api/mark-task-complete/?id=${id}`, {
      method: 'PATCH',
      headers: {
        // "Content-Type": "application/json",
        "Accept": "application/json"
      }
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