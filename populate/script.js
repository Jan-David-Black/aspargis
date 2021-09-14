const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
setInterval(
  () => {
    const randomTemp = (Math.random() * 5) + 10;
    fetch(
      `http://localhost:8080/v1alpha1/graphql`,
      {
        method: 'POST',
        headers: {"X-Hasura-Admin-Secret":"mylongsecretkey"},
        body: JSON.stringify({
          query: `
            mutation ($temp: numeric) {
              insert_temperature (
                objects: [{
                  temperature: $temp
                  location: "London"
                }]
              ) {
                returning {
                  recorded_at
                  temperature
                }
              }
            }
          `,
          variables: {
            temp: randomTemp
          }
        })
      }
    ).then((resp) => resp.json().then((respObj) => console.log(JSON.stringify(respObj, null, 2))));
  },
  2000
);
