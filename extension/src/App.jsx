/*global chrome:true*/

import { useImmer } from "use-immer";
import axios from "axios";
import Login from "./Login";

import "./App.css";
import { useState } from "react";

const API_SERVER = "https://localhost:4001/";

function App() {
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [loginDetails, setLoginDetails] = useImmer({
    username: "",
    password: "",
  });

  async function handleFormSubmit(e) {
    e.preventDefault();
    try {
      setIsPending(true);
      const response = await axios.post(
        API_SERVER + "users/login",
        loginDetails
      );
      setIsPending(false);
      setCurrentUser(response.data);
    } catch (err) {
      console.log(err);
      setIsPending(false);
      setError(err);
      return err;
    }
  }

  function handleUsernameChange(e) {
    setLoginDetails((draft) => {
      draft.username = e.target.value;
    });
  }

  function handlePasswordChange(e) {
    setLoginDetails((draft) => {
      draft.password = e.target.value;
    });
  }

  if (isPending) {
    return <div>Loading...</div>;
  }

  const HNfavActionBtn = async () => {
    // eslint-disable-next-line no-undef
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab) {
      try {
        console.log("about to execute script");

        const response = await chrome.runtime.sendMessage(
          { name: "GetCommentsCommand", tabId: tab.id },
          () => {
            console.log("done sent to background");
          }
        );

        console.log(response);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      {currentUser ? (
        <div className="card">
          <button onClick={HNfavActionBtn}>Import from HN</button>
        </div>
      ) : (
        <>
          <Login
            submit={handleFormSubmit}
            userDetails={loginDetails}
            onUsernameChange={handleUsernameChange}
            onPasswordChange={handlePasswordChange}
          />
          <p>{error.message}</p>
        </>
      )}
    </>
  );
}

export default App;
