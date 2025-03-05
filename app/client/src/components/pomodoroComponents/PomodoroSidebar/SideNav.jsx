import React from "react";
import {Input} from "../../utils/Input.jsx";

const SideNav = (props, state) => {

    return(
        <div className="side-nav">
            <a href={'#section'}>About</a>
            <a href={'#section'}>Services</a>
            <a href={'#section'}>Clients</a>
            <a href={'#section'}>Contact</a>
        </div>
    );
}