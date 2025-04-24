import { Typography, Button } from "@mui/material";
import { openAuth } from "../../store/slices/popperSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import UserProfileDrawer from "../user/UserProfileDrawer";
import { WalletProvider } from "@/context/walletProvider";


const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      <div className="w-[90vw] mx-auto bg-slate-400/15 mt-[20px] rounded-[5rem] p-[1%] backdrop-blur-xs">
        <Typography variant="body" 
        component = {Link}
        to = "/"
        sx={{
          paddingLeft: '20px',
          fontSize: '25px',
          fontWeight: '500',
        }}
         >
          <em>Stock
            <span className="text-blue-500"> 
              Vision
            </span>
            </em>
        </Typography>
        <div className='flex float-right'>
        {user ? (
          <>
            <Link to="/stocks">
              <Button>Stocks</Button>
            </Link>
            <Link to="/portfolio">
              <Button>Portfolio</Button>
            </Link>
            <Link to="/orders">
              <Button>Orders</Button>
            </Link>
            <UserProfileDrawer/>
          </>
        ) : (
          <Button onClick={() => dispatch(openAuth())}>
            Login
          </Button>)}
        </div>
      </div>
    </>
  )
}

export default Navbar;
