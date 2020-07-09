const postUserSisData = async (context, event) => {
  // get some data off of context
  const { userSubmittedData } = context;

  return fetch(`/userSisImport`, {
    method: 'post',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userSubmittedData),
  }).then((response) => response.json());
};

export default postUserSisData;
