import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  Paper,
  Stack,
  Slider,
  Button,
  IconButton,
  Popover,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { HexColorPicker } from "react-colorful";
import { Design, DesignElement } from "../../types/design";
import { FURNITURE_CATALOG } from "../../types/furniture";

interface RoomDesignerProps {
  initialDesign: Design;
  onDesignChange: (design: Design) => void;
  selectedElement: string | null;
  onUpdateElement?: (
    elementId: string,
    updates: Partial<DesignElement>
  ) => void;
  onElementRemove?: (elementId: string) => void;
}

const RoomDesigner: React.FC<RoomDesignerProps> = ({
  initialDesign,
  onDesignChange,
  selectedElement,
  onUpdateElement,
  onElementRemove,
}) => {
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0, z: 0 });
  const [localRotation, setLocalRotation] = useState({ x: 0, y: 0, z: 0 });
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [colorTarget, setColorTarget] = useState<
    "walls" | "floor" | "furniture" | null
  >(null);

  const handleRoomChange = (field: keyof Design["room"], value: number) => {
    onDesignChange({
      ...initialDesign,
      room: {
        ...initialDesign.room,
        [field]: value,
      },
    });
  };

  const selectedFurniture = selectedElement
    ? initialDesign.elements.find((el) => el.id === selectedElement)
    : null;

  const furnitureTemplate = selectedFurniture
    ? FURNITURE_CATALOG.find(
        (f) => f.category.toLowerCase() === selectedFurniture.type
      )
    : null;

  useEffect(() => {
    if (selectedFurniture) {
      setLocalPosition(selectedFurniture.position);
      setLocalRotation(selectedFurniture.rotation);
    }
  }, [selectedFurniture]);

  const handlePositionChange = (axis: "x" | "z", value: number) => {
    if (!selectedElement || !onUpdateElement || !selectedFurniture) return;

    // Update local state immediately for smooth UI
    setLocalPosition((prev) => ({ ...prev, [axis]: value }));

    // Clamp values between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value));

    // Update the actual furniture position
    onUpdateElement(selectedElement, {
      position: {
        ...selectedFurniture.position,
        [axis]: clampedValue,
      },
    });
  };

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    if (!selectedElement || !onUpdateElement || !selectedFurniture) return;

    // Update local state immediately for smooth UI
    setLocalRotation((prev) => ({ ...prev, [axis]: value }));

    // Update the actual furniture rotation
    onUpdateElement(selectedElement, {
      rotation: {
        ...selectedFurniture.rotation,
        [axis]: value,
      },
    });
  };

  const handleColorClick = (
    event: React.MouseEvent<HTMLElement>,
    target: "walls" | "floor" | "furniture"
  ) => {
    setColorPickerAnchor(event.currentTarget);
    setColorTarget(target);
  };

  const handleColorClose = () => {
    setColorPickerAnchor(null);
    setColorTarget(null);
  };

  const handleColorChange = (color: string) => {
    if (!colorTarget) return;

    if (colorTarget === "furniture" && selectedElement && onUpdateElement) {
      onUpdateElement(selectedElement, { color });
    } else {
      onDesignChange({
        ...initialDesign,
        room: {
          ...initialDesign.room,
          colorScheme: {
            ...initialDesign.room.colorScheme,
            [colorTarget]: color,
          },
        },
      });
    }
  };

  return (
    <Box>
      {/* Room Colors */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Room Colors
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Walls
            </Typography>
            <IconButton
              onClick={(e) => handleColorClick(e, "walls")}
              sx={{
                bgcolor: initialDesign.room.colorScheme.walls,
                width: 40,
                height: 40,
                "&:hover": { bgcolor: initialDesign.room.colorScheme.walls },
              }}
            >
              <ColorLensIcon />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>
              Floor
            </Typography>
            <IconButton
              onClick={(e) => handleColorClick(e, "floor")}
              sx={{
                bgcolor: initialDesign.room.colorScheme.floor,
                width: 40,
                height: 40,
                "&:hover": { bgcolor: initialDesign.room.colorScheme.floor },
              }}
            >
              <ColorLensIcon />
            </IconButton>
          </Box>
        </Stack>
      </Paper>

      {/* Room Dimensions */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Width (m)"
            type="number"
            value={initialDesign.room.width}
            onChange={(e) =>
              handleRoomChange("width", Math.max(1, Number(e.target.value)))
            }
            inputProps={{ min: 1, step: 0.1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Length (m)"
            type="number"
            value={initialDesign.room.length}
            onChange={(e) =>
              handleRoomChange("length", Math.max(1, Number(e.target.value)))
            }
            inputProps={{ min: 1, step: 0.1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Height (m)"
            type="number"
            value={initialDesign.room.height}
            onChange={(e) =>
              handleRoomChange("height", Math.max(1, Number(e.target.value)))
            }
            inputProps={{ min: 1, step: 0.1 }}
          />
        </Grid>
      </Grid>

      {selectedFurniture && furnitureTemplate && (
        <>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 2, mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle2">
                Selected Furniture: {furnitureTemplate.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={(e) => handleColorClick(e, "furniture")}
                  sx={{
                    bgcolor: selectedFurniture.color,
                    width: 32,
                    height: 32,
                    "&:hover": { bgcolor: selectedFurniture.color },
                  }}
                >
                  <ColorLensIcon fontSize="small" />
                </IconButton>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() =>
                    selectedElement && onElementRemove?.(selectedElement)
                  }
                  size="small"
                >
                  Remove
                </Button>
              </Stack>
            </Stack>
            <Typography variant="subtitle2" gutterBottom>
              Position Controls
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography gutterBottom>Left to Right Position</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPosition.x}
                      onChange={(_, value) =>
                        handlePositionChange("x", value as number)
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      marks={[
                        { value: 0, label: "Left" },
                        { value: 1, label: "Right" },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      size="small"
                      value={localPosition.x.toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          handlePositionChange("x", value);
                        }
                      }}
                      inputProps={{
                        type: "number",
                        min: 0,
                        max: 1,
                        step: 0.01,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography gutterBottom>Front to Back Position</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localPosition.z}
                      onChange={(_, value) =>
                        handlePositionChange("z", value as number)
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      marks={[
                        { value: 0, label: "Front" },
                        { value: 1, label: "Back" },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      size="small"
                      value={localPosition.z.toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          handlePositionChange("z", value);
                        }
                      }}
                      inputProps={{
                        type: "number",
                        min: 0,
                        max: 1,
                        step: 0.01,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rotation Controls
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography gutterBottom>
                  Rotate Around Y Axis (Turn Left/Right)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={localRotation.y}
                      onChange={(_, value) =>
                        handleRotationChange("y", value as number)
                      }
                      min={0}
                      max={Math.PI * 2}
                      step={Math.PI / 12}
                      marks={[
                        { value: 0, label: "0°" },
                        { value: Math.PI / 2, label: "90°" },
                        { value: Math.PI, label: "180°" },
                        { value: (Math.PI * 3) / 2, label: "270°" },
                        { value: Math.PI * 2, label: "360°" },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      size="small"
                      value={((localRotation.y * 180) / Math.PI).toFixed(0)}
                      onChange={(e) => {
                        const degrees = parseFloat(e.target.value);
                        if (!isNaN(degrees)) {
                          handleRotationChange("y", (degrees * Math.PI) / 180);
                        }
                      }}
                      inputProps={{
                        type: "number",
                        min: 0,
                        max: 360,
                        step: 15,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Paper>
        </>
      )}

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleColorClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker
            color={
              colorTarget === "furniture" && selectedFurniture
                ? selectedFurniture.color
                : colorTarget && colorTarget !== "furniture"
                ? initialDesign.room.colorScheme[colorTarget]
                : "#ffffff"
            }
            onChange={handleColorChange}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default RoomDesigner;
