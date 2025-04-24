import InputField from "./InputField";
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import Groups3OutlinedIcon from '@mui/icons-material/Groups3Outlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { useState, useMemo, useRef } from 'react';
import { emailRegex, passwordRegex } from "../../utils/validatorConstants";
import { Alert, Button } from "@mui/material";
import { createUser } from "../../services/firebaseAuth";

const Register = () => {
  // confirm password ref
  const ref = useRef(null);

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [validEntryStatus, setValidEntryStatus] = useState({
    firstName: false,
    lastName: false,
    password: false,
    confirmPassword: false,
    email: false
  });

  const [inputErrors, setInputErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const isValid = useMemo(()=>(
    validEntryStatus.password && validEntryStatus.confirmPassword && validEntryStatus.email
  ), [validEntryStatus])

  const onChange = (e) => {
    const {name, value} = e.target;

    name === "Email Address" ? setRegisterData((registerData) => ({
      ...registerData,
      email: value
    })) : name === "Name" ? setRegisterData((registerData) => ({
      ...registerData,
      firstName: value
    })) : name === "Surname" ? setRegisterData((registerData) => ({
      ...registerData,
      lastName: value
    })) : name === "Password" ? function(){
        ref.current.querySelector("input").value = ''
        setRegisterData((registerData) => ({
        ...registerData,
        password: value,
        confirmPassword: ''
      }))}() : name === "Confirm Password" ? setRegisterData((registerData) => ({
      ...registerData,
      confirmPassword: value
    })) : null

    updateValidations(name, value);
  }

  const updateValidations = (name, value) => {
    name === "Name" ? setValidEntryStatus((validEntryStatus) => ({
      ...validEntryStatus,
      firstName: value.length >= 2 
    })) : name === "Surname" ? setValidEntryStatus((validEntryStatus) => ({
      ...validEntryStatus,
      lastName: value.length >= 2 
    })) : name === "Email Address" ? function(){
      const status = emailRegex.test(value)
      setValidEntryStatus((validEntryStatus) => ({
      ...validEntryStatus,
      email: status 
    }))}() : name === "Password" ? function(){
      const status = passwordRegex.test(value)
      setValidEntryStatus((validEntryStatus) => ({
      ...validEntryStatus,
      password: status,
      confirmPassword: false
    }))}() : name === "Confirm Password" ? setValidEntryStatus((validEntryStatus) => ({
      ...validEntryStatus,
      confirmPassword: value !== '' && registerData.password === value
    })) : null
  }

  const handleSubmit = async (e) => 
  {
    e.preventDefault();
    try {
      const res = await createUser(registerData.email, registerData.password);
      navigate("/stocks");
    } catch (err) {
      console.error("Error during Sign up process:", err);

      if (err.code === "auth/email-already-in-use") {
        setInputErrors({ email: "Email is already in use. Try logging in!" });
      } else if (err.code === "auth/invalid-email") {
        setInputErrors({ email: "Please enter a valid email address." });
      } else if (err.code === "auth/weak-password") {
        setInputErrors({ password: "Weak password. Use at least 6 characters." });
      } else {
        setGeneralError("Something went wrong. Please try again!");
      }
    }
  }
 
  return ( 

    <div className="flex flex-col justify-center animate-slideInFromRight overflow-hidden animate-slideInFromLeft">
    {generalError && (
      <div className="flex justify-center my-2">
        <Alert severity="error" className="w-full"  onClose={() => setGeneralError("")}>{generalError}</Alert>
      </div>
    )}
    <form className="overflow-hidden" onSubmit={handleSubmit}>
        <span className="flex flex-row w-[100%] gap-1">
          <InputField autoComplete="off" label="Name" Icon={PersonPinOutlinedIcon} onChange={onChange} checked={validEntryStatus.firstName}/>
          <InputField autoComplete="off" label="Surname" Icon={Groups3OutlinedIcon} onChange={onChange} checked={validEntryStatus.lastName}/>
        </span>
        <InputField autoComplete="email" label="Email Address" Icon={MailOutlinedIcon} onChange={onChange}
         checked={validEntryStatus.email}   error={Boolean(inputErrors.email)}  helperText={inputErrors.email}
          toolTip tooltipData={
            {
              title: "Enter a valid email address",
              tips: ["format: abc@xyz.com"]
            }
          }
         />
        <InputField autoComplete="password" label="Password" Icon={PasswordOutlinedIcon} onChange={onChange} checked={validEntryStatus.password}
          error={Boolean(inputErrors.password)}
          helperText={inputErrors.password}
          toolTip tooltipData={
            {
              title: "Should contain at least:",
              tips: [
                "8 characters",
                "1 uppercase letter",
                "1 lowercase letter",
                "1 number",
                "1 special character"
              ]
            }
          }
        />
        <InputField ref={ref} autoComplete="off" label="Confirm Password" Icon={KeyOutlinedIcon} onChange={onChange} 
          checked={validEntryStatus.confirmPassword}
          toolTip tooltipData={
            {
              title: "Exactly same as password",
              tips: []
            }
          }
          />
        <Button
          type = "submit"
          variant="contained"
          className={`!rounded-[30px] w-full !mt-2 !p-2 text-white cursor-pointer ${isValid && "!bg-black"}`}
          disabled={!(isValid)}
          sx={{
            '&.MuiButton-root': {
              '&.Mui-disabled': {
                backgroundColor: "rgba(0, 0, 0, 0.2) !important"
              }
            }
          }}
        >
          Submit
        </Button>
    </form>
  </div>
  )
}

export default Register;
