import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import ProfileButton from "./ProfileButton";
import {Link} from 'react-router-dom';

import { AppBar, Toolbar, Typography} from '@mui/material';

function Header() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    return(
        <AppBar position="static" >
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/">
                        Aspargis
                    </Link>
                </Typography>
                {isLoading ? null : isAuthenticated ? <ProfileButton user={user}/> : <LoginButton />}
            </Toolbar>
        </AppBar>
    );
};

export default Header;