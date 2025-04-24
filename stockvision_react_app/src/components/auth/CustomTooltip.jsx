import React, { useRef } from "react";
import Popper from "@mui/material/Popper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const CustomTooltip = ({ open, anchorEl, data = [], placement = "top-end" }) => {
  const arrowRef = useRef(null);

  return (
    anchorEl && (
      <Popper
        container={document.body}
        placement={placement}
        open={open}
        anchorEl={anchorEl}
        sx={{
          zIndex: 9999,
          transition: "opacity 0.2s ease-in-out",
        }}
        modifiers={[
          {
            name: "arrow",
            enabled: true,
            options: {
              element: arrowRef.current || undefined,
            },
          },
        ]}
      >
        <Box
          sx={{
            position: "relative",
            bgcolor: "white",
            p: 2,
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "rgba(0, 0, 0, 0.2)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            typography: "body2",
            maxWidth: 250,
          }}
        >
          <Box
            ref={arrowRef}
            sx={{
              position: "absolute",
              width: 12,
              height: 12,
              bgcolor: "white",
              transform: "rotate(135deg)",
              bottom: placement.includes("top") ? -6 : "auto",
              top: placement.includes("bottom") ? -6 : "auto",
              left: placement.includes("start") ? "20px" : placement.includes("end") ? "calc(100% - 20px)" : "50%",
              marginLeft: placement.includes("start") || placement.includes("end") ? "0px" : "-6px",
              borderTop: "1px solid rgba(0, 0, 0, 0.2)",
              borderRight: "1px solid rgba(0, 0, 0, 0.2)",
              marginTop: "-6px",
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "rgba(0,0,0,0.8)" }}>
            {data.title}
          </Typography>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {data.tips.map((text, index) => (
              <li key={index} style={{ color: "rgba(0,0,0,0.7)", padding: "2px 0" }}>
                • {text}
              </li>
            ))}
          </ul>
        </Box>
      </Popper>
    )
  );
};

export default CustomTooltip;
