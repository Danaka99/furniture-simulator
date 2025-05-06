import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Stack,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { FurnitureTemplate } from "../../types/furniture";
import { useCart } from "../../contexts/CartContext";
import { FURNITURE_CATALOG } from "../../types/furniture";

interface FurniturePickerProps {
  onSelectFurniture: (furniture: FurnitureTemplate) => void;
}

const FurniturePicker: React.FC<FurniturePickerProps> = ({
  onSelectFurniture,
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (
    event: React.MouseEvent,
    furniture: FurnitureTemplate
  ) => {
    event.stopPropagation();
    try {
      console.log(
        "Adding furniture to cart:",
        JSON.stringify(
          {
            id: furniture.id,
            category: furniture.category,
            name: furniture.name,
            price: furniture.price,
          },
          null,
          2
        )
      );

      const cartItem = {
        furnitureId: furniture.id,
        type: furniture.category,
        name: furniture.name,
        price: furniture.price,
        quantity: 1,
      };

      console.log("Cart item to be added:", JSON.stringify(cartItem, null, 2));
      await addToCart(cartItem);
      console.log("Successfully added to cart");
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      if (error instanceof Error) {
        const errorMessage = error.message;
        try {
          // Try to parse the error message as JSON if it contains validation details
          const errorDetails = JSON.parse(
            errorMessage.substring(errorMessage.indexOf("{"))
          );
          console.error("Validation error details:", errorDetails);
        } catch {
          console.error("Error details:", errorMessage);
        }
      }
    }
  };

  return (
    <Grid container spacing={2}>
      {FURNITURE_CATALOG.map((furniture) => (
        <Grid item xs={6} key={furniture.id}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": {
                boxShadow: 6,
              },
            }}
            onClick={() => onSelectFurniture(furniture)}
          >
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Box>
                <Typography variant="h4" component="span">
                  {furniture.thumbnail}
                </Typography>
                <Typography variant="body2" display="block">
                  {furniture.name}
                </Typography>
                <Typography variant="body2" color="primary">
                  ${furniture.price.toFixed(2)}
                </Typography>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Add to cart">
                    <IconButton
                      size="small"
                      onClick={(e) => handleAddToCart(e, furniture)}
                      color="primary"
                    >
                      <ShoppingCartIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FurniturePicker;
