import React , { useEffect, useState} from 'react';
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuth0 } from "@auth0/auth0-react";



function AuthApolloProvider (props){
    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
    const [accessToken, setAccessToken] = useState();
    const [client, setClient] = useState();

    const httpLink = createHttpLink({
        uri: 'https://aspargis.de/v1alpha1/graphql',
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
                console.log("error fetching jwt:", e.message);
            }
        };
        getToken();
    }, []);

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
        setClient(client);
      }, [accessToken]);


    if (isLoading) {
    return "Loading...";
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