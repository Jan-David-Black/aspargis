import React from "react";
import QrReader from 'react-web-qr-reader';
import BottomRightFab from './BottomRightFab';
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
      const res=result.data;
      acquireSensor({variables: {SGroupID: res.substring(res.length-6)}});
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
      <QrReader
        delay={delay}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      />
    </BottomRightFab>
  );
}

export default QrAddDialog