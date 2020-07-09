const checkSisImportProgress = async function (context, event) {
  // grab the sis import id off of context
  const { id } = context.sisImportObject;

  return fetch(`/sisImportStatus/${id}`, {
    method: 'get',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());
};

export default checkSisImportProgress;
