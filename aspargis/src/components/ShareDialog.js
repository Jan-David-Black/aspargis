import React, {useState} from "react";
import BottomRightFab from './BottomRightFab';
import {TextField, Button} from "@mui/material";
import { useQuery, useMutation, gql } from "@apollo/client";

const SHARE_SENSOR = gql`
mutation shareSensor($SGroupID: Int!, $user: String!) {
  insert_share_one(object: {SGroup: $SGroupID, User: $user}, on_conflict: {constraint: share_pkey, update_columns: []}) {
    __typename
  }
}

`

const FIND_USER = gql`
query findUserID($email: String!) {
  Users(where: {email: {_eq: $email}}) {
    user_id
  }
}
`

function ShareDialog(props) {
  const [email, setEmail] = useState("test");
  const [open, setOpen] = useState(false);

  const [shareSensor] = useMutation(SHARE_SENSOR);
  const {loading, error, data} = useQuery(FIND_USER, {variables:{email:email}});

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleShare = () => {
    shareSensor({variables:{SGroupID:props.SGroupID, user:data.Users[0].user_id}});
    handleClose();
  };


  return (
    <BottomRightFab handleClickOpen={handleClickOpen} handleClose={handleClose} open={open}>
      <TextField value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
      <Button disabled={loading||data.Users.length===0} onClick={handleShare}>Share</Button>
    </BottomRightFab>
  );
}

export default ShareDialog