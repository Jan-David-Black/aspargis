import React, {useState} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {Button} from "@mui/material";
import Loading from './Loading';

function LoginButton(){
  const [clicked, setClicked] = useState(false);
  const { loginWithRedirect } = useAuth0();

  const handleClick = () =>{
    setClicked(true);
    loginWithRedirect();
  }
  if(clicked) return <Loading/>
  return <Button color="inherit" onClick={handleClick}>Log In</Button>;
};

export default LoginButton;