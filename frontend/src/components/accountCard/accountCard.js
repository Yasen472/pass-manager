import React from "react";
import { CgProfile } from "react-icons/cg";
import './accountCard.css';

const AccountCard = ({ account, onClick }) => {
    return (
        <div className="card-container" onClick={onClick}>
            <div className="icon-container">
                <CgProfile color="#4079ff" size={65} />
            </div>
            <div className="details-container">
                <div style={{ fontWeight: 500 }}>{account.accountName}</div> {/* Changed from website to accountName */}
                <div style={{ fontWeight: 200 }}>{account.email}</div>
            </div>
        </div>
    );
};

export default AccountCard;
