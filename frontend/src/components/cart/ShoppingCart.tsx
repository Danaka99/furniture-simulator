import React, { useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  Divider,
  Paper,
  CircularProgress,
  Stack,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCart } from "../../contexts/CartContext";

const ShoppingCart: React.FC = () => {
  const theme = useTheme();
  const {
    items = [],
    removeFromCart,
    clearCart,
    loading,
    error,
    refreshCart,
    updateQuantity,
  } = useCart();

  // Fetch cart data when component mounts
  useEffect(() => {
    refreshCart();
  }, []);

  // Calculate total
  const total = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const handleQuantityChange = async (
    furnitureId: string,
    newQuantity: number
  ) => {
    try {
      if (newQuantity > 0) {
        await updateQuantity(furnitureId, newQuantity);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6" component="h2" color="primary">
            Shopping Cart
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            {items.length} {items.length === 1 ? "item" : "items"}
          </Typography>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ p: 2, bgcolor: "error.light", color: "error.contrastText" }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {!Array.isArray(items) || items.length === 0 ? (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, overflow: "auto", py: 0 }}>
            {items.map((item) => (
              <React.Fragment key={item.id || item.furnitureId}>
                <ListItem
                  sx={{
                    py: 2,
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <Typography variant="subtitle1" component="div">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.price.toFixed(2)} each
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mr: 6,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          item.id || item.furnitureId,
                          item.quantity - 1
                        )
                      }
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleQuantityChange(
                            item.id || item.furnitureId,
                            value
                          );
                        }
                      }}
                      inputProps={{
                        min: 1,
                        style: {
                          width: "40px",
                          textAlign: "center",
                          padding: "4px",
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "divider",
                          },
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          item.id || item.furnitureId,
                          item.quantity + 1
                        )
                      }
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        ml: 2,
                        minWidth: "80px",
                        color: "primary.main",
                        fontWeight: "medium",
                      }}
                    >
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() =>
                        removeFromCart(item.id || item.furnitureId)
                      }
                      sx={{
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.main">
                ${total.toFixed(2)}
              </Typography>
            </Box>
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => alert("Proceeding to checkout...")}
                sx={{
                  py: 1.5,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                sx={{
                  "&:hover": {
                    bgcolor: "error.light",
                  },
                }}
              >
                Clear Cart
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ShoppingCart;
