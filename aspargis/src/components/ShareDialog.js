import React, {useState} from "react";
import BottomRightFab from './BottomRightFab';
import {TextField, Button, Grid, Chip} from "@mui/material";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

const SHARE_SENSOR = gql`
mutation shareSensor($SGroupID: Int!, $user: String!) {
  insert_share_one(object: {SGroup: $SGroupID, User: $user}, on_conflict: {constraint: share_pkey, update_columns: []}) {
    __typename
  }
}`

const REMOVE_SHARE = gql`
mutation unshareSensor($SGroupID: Int!, $user: String!) {
  delete_share_by_pk(SGroup: $SGroupID, User: $user) {
    __typename
  }
}`

const FIND_USER = gql`
query findUserID($email: String!) {
  Users(where: {email: {_eq: $email}}) {
    user_id
  }
}`

function ShareDialog(props) {
  const [email, setEmail] = useState("");
  const [shares, setShares] = useState(props.shares);
  const [open, setOpen] = useState(false);
  const {user} = useAuth0();
  const [shareSensor] = useMutation(SHARE_SENSOR);
  const [removeShare] = useMutation(REMOVE_SHARE);
  const {loading, data} = useQuery(FIND_USER, {variables:{email:email}});

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleShare = () => {
    const user = data.Users[0].user_id;
    setShares([...shares, {email, user}]);
    setEmail("");
    shareSensor({variables:{SGroupID:props.SGroupID, user}});
  };
  const handleDelete = (share) => () => {
    removeShare({variables:{SGroupID:props.SGroupID, user:share.user}});
    setShares(shares.filter((s)=>s.email!==share.email))
  }
  return (
    <BottomRightFab handleClickOpen={handleClickOpen} handleClose={handleClose} open={open}>
      <Grid container direction="column">
        <Grid item>
          Shared with:
        </Grid>
        <Grid item>
          {shares.map((share)=><Chip label={share.email} key={share.user} onDelete={handleDelete(share)} />)}
        </Grid>
        <Grid item>
          <TextField value={email} onChange={(e)=>{setEmail(e.target.value)}} variant="standard"/>
        </Grid>
        <Grid item>
          <Button 
            disabled={
              loading||
              data.Users.length===0||
              shares.some((share)=>share.email===email)||
              data.Users[0].user_id===user.sub
            } 
            onClick={handleShare}>
            Share
          </Button>
        </Grid>
      </Grid>
    </BottomRightFab>
  );
}

export default ShareDialog