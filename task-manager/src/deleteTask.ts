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
      // The server sent back a description of the error.
      throw new Error(`Server error: ${data.error}`);
    }

    return data;
  } catch(error) {
    // Throw the error to trigger the onError callback.
    throw error;
  }
};