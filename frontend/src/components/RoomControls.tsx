import React, { useState, useEffect } from "react";
import { Typography, Box, Grid, TextField, Paper } from "@mui/material";
import { Design } from "../types/design";
import "./RoomControls.css";

interface RoomControlsProps {
  design: Design;
  onDesignChange: (design: Design) => void;
}

const RoomControls: React.FC<RoomControlsProps> = ({
  design,
  onDesignChange,
}) => {
  const [dimensions, setDimensions] = useState({
    width: design.room.width,
    length: design.room.length,
    height: design.room.height,
  });

  const [colors, setColors] = useState({
    walls: design.room.colorScheme.walls,
    floor: design.room.colorScheme.floor,
  });

  useEffect(() => {
    setDimensions({
      width: design.room.width,
      length: design.room.length,
      height: design.room.height,
    });
    setColors({
      walls: design.room.colorScheme.walls,
      floor: design.room.colorScheme.floor,
    });
  }, [design]);

  const handleDimensionChange = (
    dimension: "width" | "length" | "height",
    value: number
  ) => {
    const newValue = Math.max(1, Math.min(20, value));
    const newDimensions = { ...dimensions, [dimension]: newValue };
    setDimensions(newDimensions);

    onDesignChange({
      ...design,
      room: {
        ...design.room,
        width: newDimensions.width,
        length: newDimensions.length,
        height: newDimensions.height,
      },
    });
  };

  const handleColorChange = (type: "walls" | "floor", value: string) => {
    const newColors = { ...colors, [type]: value };
    setColors(newColors);

    onDesignChange({
      ...design,
      room: {
        ...design.room,
        colorScheme: {
          ...design.room.colorScheme,
          [type]: value,
        },
      },
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Room Settings
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Dimensions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Width (m)"
              type="number"
              value={dimensions.width}
              onChange={(e) =>
                handleDimensionChange("width", Number(e.target.value))
              }
              inputProps={{ min: 1, max: 20, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Length (m)"
              type="number"
              value={dimensions.length}
              onChange={(e) =>
                handleDimensionChange("length", Number(e.target.value))
              }
              inputProps={{ min: 1, max: 20, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Height (m)"
              type="number"
              value={dimensions.height}
              onChange={(e) =>
                handleDimensionChange("height", Number(e.target.value))
              }
              inputProps={{ min: 1, max: 10, step: 0.1 }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Colors
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Walls</Typography>
            <input
              type="color"
              value={colors.walls}
              onChange={(e) => handleColorChange("walls", e.target.value)}
              style={{ width: "100%", height: 40 }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Floor</Typography>
            <input
              type="color"
              value={colors.floor}
              onChange={(e) => handleColorChange("floor", e.target.value)}
              style={{ width: "100%", height: 40 }}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RoomControls;
