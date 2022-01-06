import React from "react";
import {IconButton, Menu, MenuItem, Avatar} from '@mui/material';
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter } from 'react-router-dom';

function ProfileButton(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const {logout} = useAuth0();
    
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Avatar sx={{ width: 24, height: 24 }} alt="Avatar" src={props.user.picture} />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => props.history.push('/profile')}>Profile</MenuItem>
                <MenuItem onClick={()=>{logout({ returnTo: window.location.origin })}}>Logout</MenuItem>
            </Menu>
        </div>
    );
}

export default withRouter(ProfileButton);