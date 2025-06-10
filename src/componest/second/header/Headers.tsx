

import './header.css';
import { BackButton } from "../../allCompones/BackButton";

const Headers = ({ title = "Header" }: { title?: string }) => {
  // const navigate = useNavigate();

  // const handleBack = () => {
  //   if (window.history.length > 2) {
  //     navigate(-1);
  //   } else {
  //     navigate("/");
  //   }
  // };

  return (
    <div className="header-container">
          <BackButton/>

      <div className="header-center">
        <h1 className="header-title">
          {title}
        </h1>
      </div>

      <div className="header-right" /> {/* Spacer for right side */}
    </div>
  );
};

export default Headers;