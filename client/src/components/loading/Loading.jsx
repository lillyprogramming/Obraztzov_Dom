import React from "react";
import { MoonLoader } from "react-spinners";
import "./Loading.scss";

const Loading = () => {
  return (
    <div className="loading-container">
      <MoonLoader color="white" />
    </div>
  );
};

export default Loading;
