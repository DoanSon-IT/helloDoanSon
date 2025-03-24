import { TextField } from "@mui/material";

const Input = ({ type = "text", label, ...props }) => {
    return (
        <TextField type={type} label={label} variant="outlined" fullWidth {...props} />
    );
};

export default Input;
