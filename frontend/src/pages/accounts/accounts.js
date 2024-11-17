import React, { useState } from 'react';
import './accounts.css';
import { CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import AccountCard from '../../components/accountCard/accountCard.js';
import { FaRegEdit } from "react-icons/fa";
import DetailsCard from '../../components/detailsCard/detailsCard.js';

const Accounts = () => {
    return (
        <div className="accounts-page-container">
            <div className="left-content-container">
                <div className="heading">Accounts List</div>
                <hr />
                <div className="filtration-container">
                    <input type="text" placeholder='Search Accounts'></input>
                    {/* <CiSearch className='search-icon' size={20}/> */}
                    <button className='sort-btn'>Sort</button>
                </div>

                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
                <AccountCard />
            </div>

            <div className="vertical-divider"></div>

            <div className="right-content-container">
                <div className="heading">Account Information</div>
                <hr />
                <div className="left-section">
                <CgProfile size={400} color="#4079ff" />
                <div className="account-name-heading">Microsoft</div>
                </div>
            </div>
        </div>
    );
};

export default Accounts;
