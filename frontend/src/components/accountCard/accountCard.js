// import React, { useState } from "react"
// import { CgProfile } from "react-icons/cg";
// import './accountCard.css'


// const AccountCard = () => {

//     const [account, setAccount] = useState({
//         "accountName": "Microsoft",
//         "email": "yasengeorgiev44@gmail.com",
//         "username": "YascoPi4a",
//         "password": "123fsdfdsfd"
//     })

//   return (
//     <div className="card-container">
//       <div className="icon-container">
//         <CgProfile color="#4079ff" size={65}/>
//         </div>
//         <div className="details-container">
//           <div style={{fontWeight: 500}}>{account.accountName}</div>
//           <div style={{fontWeight: 200}}>{account.email}</div>
//         </div>
//     </div>
//   )
// }

// export default AccountCard

import React from "react";
import { CgProfile } from "react-icons/cg";
import './accountCard.css';
import { useAuth } from "../../context/authContext.js";

const AccountCard = ({ account, onClick }) => {
    return (
        <div className="card-container" onClick={onClick}>
            <div className="icon-container">
                <CgProfile color="#4079ff" size={65} />
            </div>
            <div className="details-container">
                <div style={{ fontWeight: 500 }}>{account.website}</div>
                <div style={{ fontWeight: 200 }}>{account.email}</div>
            </div>
        </div>
    );
};

export default AccountCard;
