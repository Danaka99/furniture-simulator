import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FurnitureTemplate, FURNITURE_CATALOG } from "../../types/furniture";
import { Design, DesignElement } from "../../types/design";
import { v4 as uuidv4 } from "uuid";

interface FurnitureSelectorProps {
  design: Design;
  onDesignUpdate: (design: Design) => void;
  onElementSelect: (elementId: string | null) => void;
}

const FurnitureSelector: React.FC<FurnitureSelectorProps> = ({
  design,
  onDesignUpdate,
  onElementSelect,
}) => {
  const handleAddFurniture = (template: FurnitureTemplate) => {
    // Calculate center position of the room
    const centerX = 0.5; // Normalized coordinates (0-1)
    const centerZ = 0.5;

    const newElement: DesignElement = {
      id: uuidv4(),
      type: template.category.toLowerCase() as
        | "table"
        | "chair"
        | "sofa"
        | "bed"
        | "cabinet"
        | "lamp",
      position: {
        x: centerX,
        y: 0, // Place on floor
        z: centerZ,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
      color: "#FFFFFF",
      shade: 0,
    };

    const updatedDesign = {
      ...design,
      elements: [...design.elements, newElement],
    };

    onDesignUpdate(updatedDesign);
    onElementSelect(newElement.id); // Select the newly added furniture
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Furniture
      </Typography>
      <Grid container spacing={2}>
        {FURNITURE_CATALOG.map((furniture) => (
          <Grid item xs={12} sm={6} key={furniture.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 1,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h4" component="span">
                      {furniture.thumbnail}
                    </Typography>
                    <Typography variant="body2" display="block">
                      {furniture.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {furniture.defaultDimensions.width}m ×{" "}
                      {furniture.defaultDimensions.length}m
                    </Typography>
                  </Box>
                  <Tooltip title="Add to room">
                    <IconButton
                      size="small"
                      onClick={() => handleAddFurniture(furniture)}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default FurnitureSelector;
