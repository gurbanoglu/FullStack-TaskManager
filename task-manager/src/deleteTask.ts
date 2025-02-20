export const deleteTask = async ( id: string ) => {
  try {
    const response = await fetch(`/api/delete-task/?id=${id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
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