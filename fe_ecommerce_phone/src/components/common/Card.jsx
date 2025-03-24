import { Card as MuiCard, CardContent as MuiCardContent, CardHeader as MuiCardHeader, CardActions, Typography } from "@mui/material";

export const Card = ({ children, ...props }) => (
    <MuiCard {...props}>{children}</MuiCard>
);

export const CardContent = ({ children, ...props }) => (
    <MuiCardContent {...props}>{children}</MuiCardContent>
);

export const CardHeader = ({ title, subheader, ...props }) => (
    <MuiCardHeader title={title} subheader={subheader} {...props} />
);

export const CardFooter = ({ children, ...props }) => (
    <CardActions {...props}>{children}</CardActions>
);

// ✅ Thêm CardTitle và CardDescription
export const CardTitle = ({ children, ...props }) => (
    <Typography variant="h6" {...props}>{children}</Typography>
);

export const CardDescription = ({ children, ...props }) => (
    <Typography variant="body2" color="textSecondary" {...props}>{children}</Typography>
);
