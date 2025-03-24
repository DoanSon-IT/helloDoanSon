import { Button as MuiButton } from "@mui/material";

const Button = ({ children, variant = "contained", color = "primary", ...props }) => {
    return (
        <MuiButton variant={variant} color={color} {...props} className="px-4 py-2 font-semibold rounded-lg">
            {children}
        </MuiButton>
    );
};

export default Button;
