import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../assets/profile.css";
import {subscribe} from "../util/pushSubscription";
import { useMutation, gql } from "@apollo/client";


const SUB_MUTATION = gql`
mutation setSub($sub: jsonb!, $user: String!) {
  update_Users_by_pk(pk_columns: {user_id: $user}, _append: {subscriptions: $sub}) {
    user_id
  }
}
`

const Profile = () => {
  const { user, isAuthenticated} = useAuth0();
  const [subMutate] = useMutation(SUB_MUTATION);

  subscribe().then((sub)=>{
    console.log("Sub:", sub);
    if(sub.new){
      subMutate({variables: {sub:sub.sub, user:user.sub}});
    }
  });

  return (
    isAuthenticated && (
      <div className="profile-container">
        <img src={user.picture} alt={user.name} className="profile-picture"/>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export default Profile;