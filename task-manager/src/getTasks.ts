export const getTasks = async () => {
  try {
    const response = await fetch('/api/get-tasks/', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    })

    const data = await response.json();

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