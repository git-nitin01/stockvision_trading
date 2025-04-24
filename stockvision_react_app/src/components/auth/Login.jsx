import { Alert, Button } from "@mui/material";
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import InputField from "./InputField";
import { useState } from "react";
import { emailRegex } from "../../utils/validatorConstants";
import { login } from "../../services/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const Login = ({ setAuthState }) => {
  const [data, setData] = useState({
    email: '',
    password: ''
  })

  const navigate = useNavigate();
  const authPopper = useSelector((state) => state.popper.authPopper);
  const dispatch = useDispatch();


  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(null);

  function isValidEmail(email) {
    emailRegex.test(email) ? setIsValid(true) : setIsValid(false);
  }

  const onChange = (e) => {
    const { name, value } = e.target
    name === "Email Address" ? function(){
      setData(data => ({ ...data, email: value }))
      isValidEmail(value)
    }(): name === "Password" ? setData(data => ({ ...data, password: value })) : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(data.email, data.password);
      console.log(res);
      navigate("/stocks");
    } catch (err) {
      console.error("Error during login process:", err);

      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if(err.code === "auth/invalid-credential") {
        setError("Invalid Credentials. Please try again!");
      } else{
        setError("Login failed. Please try again!");
      } 
    }
  };

  return (
  <div className="flex flex-col justify-center animate-slideInFromRight">
  {error && (
        <div className="flex justify-center my-2">
          <Alert severity="error" className="w-full"  onClose={() => setError("")}>{error}</Alert>
        </div>
      )}
    <form onSubmit={handleSubmit}>
        <InputField autoComplete="email" label="Email Address" Icon={MailOutlinedIcon} onChange={onChange} checked={isValid}
        toolTip tooltipData={
          {
            title: "Enter a valid email address",
            tips: ["format: abc@xyz.com"]
          }
        }
        />
        <InputField autoComplete="password" label="Password" Icon={PasswordOutlinedIcon} onChange={onChange} toolTip tooltipData={
          {
            title: "Should contain at least:",
            tips: [
            "8 characters",
            "one number",
            "one uppercase letter",
            "one lowercase letter",
            "one special character"
            ]
          }
        }/>
        <Button className="!block !normal-case !mt-[-10px] !underline !w-fit !text-center" 
        onClick={() => setAuthState({
          login: 0,
          register: 0,
          forgetPass: 1
        })}>
          Forgot your password?
        </Button>
        <Button
          type="submit"
          variant="contained"
          className={`!rounded-[30px] w-full !mt-2 !p-2 text-white cursor-pointer ${(isValid && data.password !== "") && "!bg-black"}`}
          disabled={!(isValid && data.password !== "")}
          sx={{
            '&.MuiButton-root': {
              '&.Mui-disabled': {
                backgroundColor: "rgba(0, 0, 0, 0.2) !important"
              }
            }
          }}
        >
          Continue
        </Button>
    </form>
  </div>
  )
}

export default Login;