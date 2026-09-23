import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

function Toast(props: ToastProps) {
    React.useEffect(() => {
        if (props.isVisible) {
            const timer = setTimeout(() => {
                props.onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [props.isVisible, props.onClose]);

    if (!props.isVisible) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 9999,
                backgroundColor: "success.main",
                color: "success.contrastText",
                padding: "12px 20px",
                borderRadius: "8px",
                boxShadow: 4,
                display: "flex",
                alignItems: "center",
                gap: 1,
                animation: "slideIn 0.3s ease-out",
                "@keyframes slideIn": {
                    from: {
                        transform: "translateX(100%)",
                        opacity: 0,
                    },
                    to: {
                        transform: "translateX(0)",
                        opacity: 1,
                    },
                },
            }}
        >
            <CheckCircleIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {props.message}
            </Typography>
        </Box>
    );
}

export default Toast;
