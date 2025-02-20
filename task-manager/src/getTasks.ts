export const getTasks = async () => {
  try {
    const response = await fetch('/api/get-tasks/', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    })

    const data = await response.json();

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