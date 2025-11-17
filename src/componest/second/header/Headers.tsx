

import './header.css';
import { BackButton } from "../../allCompones/BackButton";

const Headers = () => {


  return (
    <div className="header-container">
          <BackButton/>

      <div className="header-center">
        <h1 className="header-title">
   
        </h1>
      </div>

      <div className="header-right" /> {/* Spacer for right side */}
    </div>
  );
};

export default Headers;