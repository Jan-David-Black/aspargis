import React from "react";
import QrReader from 'react-web-qr-reader';
import BottomRightFab from './BottomRightFab';
import {Box} from "@mui/material";
import { useMutation, gql } from "@apollo/client";

const ACQUIRE_SENSOR = gql`
mutation acquireSensor($SGroupID: Int!) {
  update_SGroups(where:{SGroup:{_eq:$SGroupID}}){
    affected_rows
  }
}
`

function QrAddDialog(props) {
  const [acquireSensor] = useMutation(ACQUIRE_SENSOR, {refetchQueries:["Overview"]});
  const delay = 500;

  const previewStyle = {
    height: 150,
    width: 400,
  };

  const handleScan = (result) => {
    console.log("Found",{result});
    if(!isNaN(result.data)){
      acquireSensor({variables: {SGroupID: result.data}});
    }else{
      console.error("Non numeric values are invalid");
    }
    setOpen(false);
  };

  const handleError = (error) => {
    console.log(error);
  };

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  return (
    <BottomRightFab handleClickOpen={handleClickOpen} handleClose={handleClose} open={open}>
      <Box display="flex" alignItems="center" justifyContent="center"><QrReader
        delay={delay}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      /></Box>
    </BottomRightFab>
  );
}

export default QrAddDialog