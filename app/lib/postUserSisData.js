const postUserSisData = async (context, event) => {
  // get some data off of context
  const { userSubmittedData } = context;

  try {
    const response = await fetch(`/userSisImport`, {
      method: 'post',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userSubmittedData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw json;
    } else {
      return json;
    }
  } catch (error) {
    throw error;
  }
};

export default postUserSisData;
