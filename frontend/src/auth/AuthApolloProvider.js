import React , { useEffect, useState} from 'react';
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuth0 } from "@auth0/auth0-react";
import {LinearProgress} from "@mui/material";


function AuthApolloProvider (props){
    const {isAuthenticated, getAccessTokenSilently, isLoading} = useAuth0();
    const [accessToken, setAccessToken] = useState();
    const [client, setClient] = useState();

    const httpLink = createHttpLink({
        uri: process.env.REACT_APP_HASURA_API,
    });

    useEffect(() => {
        const getToken = async () => {  
            try {
                const aT = await getAccessTokenSilently({
                    audience: `https://aspargis.de`,
                    scope: "read:current_user",
                });
                setAccessToken(aT);
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, 500))
                const aT = await getAccessTokenSilently({
                  audience: `https://aspargis.de`,
                  scope: "read:current_user",
                });
                setAccessToken(aT);
                console.log("error fetching jwt:", e.message);
            }
        };
        getToken(); // eslint-disable-next-line
    }, [isAuthenticated]);

    useEffect(() => {
        const authLink = setContext((_, { headers }) => {
          const token = accessToken;
          if (token) {
            return {
              headers: {
                ...headers,
                authorization: `Bearer ${token}`,
              },
            };
          } else {
            return {
              headers: {
                ...headers,
              },
            };
          }
        });
    
        const client = new ApolloClient({
          link: authLink.concat(httpLink),
          cache: new InMemoryCache(),
        });
        setClient(client); // eslint-disable-next-line
      }, [accessToken]);

    if (isLoading) {
      return <LinearProgress/>;
    }

    if(isAuthenticated&&accessToken){
        return (
            <ApolloProvider client={client}> 
                {props.children}
            </ApolloProvider>
        )
    }
    return <></>
}
    
export default AuthApolloProvider;