import { Divider, Popper, TextField } from "@mui/material";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useRef } from "react";
import CustomTooltip from "./CustomTooltip";

const InputField = ({ label, Icon, autoComplete, onChange, checked, ref, error, helperText, toolTip=false, tooltipData=null }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const arrowRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  return (
    <div className="group flex flex-row border-1 w-full border-black/20 rounded-[30px] px-4 gap-2 items-center mb-2 focus-within:border-black/70">
      <Icon className="text-sm text-center text-black/40 group-focus-within:text-black/70"/>
      <Divider orientation="vertical" variant="middle" flexItem />
      <TextField
        ref={ref}
        fullWidth
        label={label}
        autoComplete={autoComplete}
        onChange={onChange}
        name={label}
        error={error}
        type={showPassword ? "text" : label === "Password" || label === "Confirm Password" ? "password" : "text"} 
        helperText={error ? helperText : ""}
        slotProps={{
          input: {
            className: "!rounded-[30px] text-gray-700",
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            display: "flex !important",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingBlock: "15px 10px",
            '& fieldset': {
              border: "none",
            }
          },
          '& .MuiOutlinedInput-input': {
            padding: "0 !important",
            marginTop: "5px",
            fontSize: "14px"
          },
          '& .MuiInputLabel-root': {
            "&.Mui-focused, &.MuiInputLabel-shrink": {
              transform: "translate(14px, 5px) scale(0.75) !important"
            },
            marginLeft: "-15px",
            fontSize: "14px"
          },
          '& .MuiFormHelperText-root': { 
            marginLeft: 0 
          }
        }}
      />

      {
        toolTip && tooltipData ?
        <>
          <div className="cursor-pointer">
            <InfoIcon onClick={handleClick} className="text-black/40"/>
          </div>
          <CustomTooltip open={open} setOpen={setOpen} anchorEl={anchorEl} data={tooltipData}/>
        </> : null
      }
      
      {label === "Password" || label === "Confirm Password" ?
      <div className="cursor-pointer">
        {showPassword ? <VisibilityIcon onClick={() => setShowPassword(false)} className="text-black/40"/> : 
        <VisibilityOffIcon onClick={() => setShowPassword(true)} className="text-black/40"/>}
      </div> : null}
      {checked &&
      <CheckRoundedIcon className="text-white bg-green-600 rounded-3xl !text-[28px] p-1"/>}
    </div>
  )
}

export default InputField;