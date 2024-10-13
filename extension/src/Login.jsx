import PropTypes from "prop-types";

function Login({ userDetails, submit, onUsernameChange, onPasswordChange }) {
  return (
    <article>
      <form onSubmit={submit}>
        <div>
          <label>Username</label>
        </div>
        <div>
          <input
            name="username"
            value={userDetails.username}
            onChange={onUsernameChange}
          />
        </div>
        <div>
          <label>Password</label>
        </div>
        <div>
          <input
            name="password"
            value={userDetails.password}
            onChange={onPasswordChange}
          />
        </div>
        <div>
          <input type="submit" value="Login" />
        </div>
      </form>
    </article>
  );
}

Login.propTypes = {
  userDetails: PropTypes.shape({
    password: PropTypes.string,
    username: PropTypes.string,
  }),
  onPasswordChange: PropTypes.func.isRequired,
  onUsernameChange: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

export default Login;
