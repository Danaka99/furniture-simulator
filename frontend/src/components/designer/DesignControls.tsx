import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import { ChromePicker } from "react-color";
import { Design } from "../../types/design";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";

interface DesignControlsProps {
  design: Design | null;
  viewMode: "2d" | "3d";
  onViewModeChange: (mode: "2d" | "3d") => void;
  onDesignUpdate: (design: Design) => void;
  selectedElement: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementRemove: (elementId: string) => void;
}

const DesignControls: React.FC<DesignControlsProps> = ({
  design,
  viewMode,
  onViewModeChange,
  onDesignUpdate,
  selectedElement,
  onElementRemove,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!design) return null;

  const selectedFurniture = selectedElement
    ? design.elements.find((e) => e.id === selectedElement)
    : null;

  const handleScaleChange = (value: number) => {
    if (!selectedElement) {
      // Scale entire design
      const updatedElements = design.elements.map((element) => ({
        ...element,
        scale: {
          x: element.scale.x * value,
          y: element.scale.y * value,
          z: element.scale.z * value,
        },
      }));
      onDesignUpdate({ ...design, elements: updatedElements });
    } else {
      // Scale selected element
      const updatedElements = design.elements.map((element) =>
        element.id === selectedElement
          ? {
              ...element,
              scale: {
                x: element.scale.x * value,
                y: element.scale.y * value,
                z: element.scale.z * value,
              },
            }
          : element
      );
      onDesignUpdate({ ...design, elements: updatedElements });
    }
  };

  const handleShadeChange = (value: number) => {
    if (!selectedElement) {
      // Shade entire design
      const updatedElements = design.elements.map((element) => ({
        ...element,
        shade: value,
      }));
      onDesignUpdate({ ...design, elements: updatedElements });
    } else {
      // Shade selected element
      const updatedElements = design.elements.map((element) =>
        element.id === selectedElement ? { ...element, shade: value } : element
      );
      onDesignUpdate({ ...design, elements: updatedElements });
    }
  };

  const handleColorChange = (color: any) => {
    if (!selectedElement) {
      // Change color of entire design
      const updatedElements = design.elements.map((element) => ({
        ...element,
        color: color.hex,
      }));
      onDesignUpdate({ ...design, elements: updatedElements });
    } else {
      // Change color of selected element
      const updatedElements = design.elements.map((element) =>
        element.id === selectedElement
          ? { ...element, color: color.hex }
          : element
      );
      onDesignUpdate({ ...design, elements: updatedElements });
    }
  };

  const handleSaveDesign = () => {
    // Here you would implement the save functionality
    console.log("Saving design:", design);
  };

  const handleDeleteDesign = () => {
    // Here you would implement the delete functionality
    console.log("Deleting design:", design);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ButtonGroup variant="contained" color="primary" fullWidth>
            <Button startIcon={<SaveIcon />} onClick={handleSaveDesign}>
              Save Design
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDesign}
              color="error"
            >
              Delete Design
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && onViewModeChange(value)}
            fullWidth
          >
            <ToggleButton value="2d">
              <ViewCompactIcon />
              <Typography sx={{ ml: 1 }}>2D View</Typography>
            </ToggleButton>
            <ToggleButton value="3d">
              <ThreeDRotationIcon />
              <Typography sx={{ ml: 1 }}>3D View</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="subtitle1">
              {selectedFurniture ? "Selected Furniture" : "All Furniture"}
            </Typography>
            {selectedFurniture && (
              <IconButton
                size="small"
                color="error"
                onClick={() => onElementRemove(selectedFurniture.id)}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
          <Typography gutterBottom>Scale</Typography>
          <Slider
            defaultValue={1}
            min={0.1}
            max={2}
            step={0.1}
            valueLabelDisplay="auto"
            onChange={(_, value) => handleScaleChange(value as number)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom>Shade</Typography>
          <Slider
            defaultValue={0}
            min={0}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
            onChange={(_, value) => handleShadeChange(value as number)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            Change Color
          </Button>
          {showColorPicker && (
            <Box sx={{ position: "absolute", zIndex: 2, mt: 1 }}>
              <ChromePicker
                color={selectedFurniture?.color || "#ffffff"}
                onChange={handleColorChange}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignControls;
