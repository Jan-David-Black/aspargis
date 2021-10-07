import React from "react";
import {Fab, Slide, IconButton, Dialog} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BottomRightFab(props) {
  return (
    <>
      <Fab onClick={props.handleClickOpen} color='primary' style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
      }}>
        <AddIcon />
      </Fab>

      <Dialog fullScreen open={props.open} onClose={props.handleClose} TransitionComponent={Transition}>
        <IconButton color="inherit" onClick={props.handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
        {props.children}
      </Dialog>
    </>
  );
}