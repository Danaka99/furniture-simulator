import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  Badge,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Pagination,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FolderIcon from "@mui/icons-material/Folder";
import RoomDesigner from "../components/designer/RoomDesigner";
import DesignViewer from "../components/designer/DesignViewer";
import FurniturePicker from "../components/designer/FurniturePicker";
import ShoppingCart from "../components/cart/ShoppingCart";
import { CartProvider, useCart } from "../contexts/CartContext";
import { DesignProvider, useDesign } from "../contexts/DesignContext";
import { Design, DesignElement } from "../types/design";
import { FurnitureTemplate } from "../types/furniture";

// Default initial design
const defaultDesign: Design = {
  id: "new-design",
  name: "New Design",
  room: {
    width: 5,
    length: 5,
    height: 3,
    shape: "rectangular",
    colorScheme: {
      walls: "#FFFFFF",
      floor: "#F0F0F0",
      ceiling: "#FFFFFF",
    },
  },
  elements: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DesignerDashboardContent = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [designsDrawerOpen, setDesignsDrawerOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");

  const { items = [] } = useCart();
  const {
    currentDesign,
    setCurrentDesign,
    saveDesign,
    updateDesign,
    deleteDesign,
    designs = [],
    createNewDesign,
    loadDesigns,
    pagination,
    loading,
  } = useDesign();

  const handleDesignUpdate = (design: Design) => {
    setCurrentDesign(design);
    setSelectedElement(null);
  };

  const handleElementSelect = (elementId: string | null) => {
    console.log("Selected element:", elementId);
    setSelectedElement(elementId);
  };

  const handleElementUpdate = (
    elementId: string,
    updates: Partial<DesignElement>
  ) => {
    if (!currentDesign) return;

    console.log("Updating element:", elementId, updates);
    const updatedElements = currentDesign.elements.map((element) =>
      element.id === elementId ? { ...element, ...updates } : element
    );

    const updatedDesign = {
      ...currentDesign,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    console.log("Updated design:", updatedDesign);
    setCurrentDesign(updatedDesign);
  };

  const handleElementRemove = (elementId: string) => {
    if (!currentDesign) return;

    console.log("Removing element:", elementId);
    const updatedElements = currentDesign.elements.filter(
      (element) => element.id !== elementId
    );

    const updatedDesign = {
      ...currentDesign,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    console.log("Updated design after removal:", updatedDesign);
    setCurrentDesign(updatedDesign);
    setSelectedElement(null);
  };

  const handleNewDesign = () => {
    createNewDesign();
    setDesignName("");
  };

  const handleSaveDesign = async () => {
    if (!currentDesign) return;

    try {
      console.log("Saving design:", { currentDesign, designName });

      // For new designs
      if (currentDesign.id === "new-design") {
        const newDesign: Design = {
          ...currentDesign,
          id: crypto.randomUUID(),
          name: designName || "Untitled Design",
          updatedAt: new Date(),
          createdAt: new Date(),
        };
        console.log("Creating new design:", newDesign);
        await saveDesign(newDesign);
      }
      // For existing designs
      else {
        const updatedDesign: Design = {
          ...currentDesign,
          name: currentDesign.name,
          updatedAt: new Date(),
        };
        console.log("Updating existing design:", updatedDesign);
        await updateDesign(updatedDesign);
      }

      setSaveDialogOpen(false);
      setDesignName("");
    } catch (error) {
      console.error("Failed to save design:", error);
      // Show error to user
      alert("Failed to save design. Please try again.");
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (window.confirm("Are you sure you want to delete this design?")) {
      try {
        await deleteDesign(designId);
      } catch (error) {
        console.error("Failed to delete design:", error);
      }
    }
  };

  const handleFurnitureSelect = (furniture: FurnitureTemplate) => {
    if (!currentDesign) return;

    console.log("Adding furniture:", furniture);
    const newElement = {
      id: crypto.randomUUID(),
      type: furniture.category.toLowerCase(),
      position: { x: 0.5, y: 0, z: 0.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: "#FFFFFF",
      shade: 0,
    };

    console.log("Created new element:", newElement);

    const updatedDesign = {
      ...currentDesign,
      elements: [...currentDesign.elements, newElement],
      updatedAt: new Date(),
    };

    console.log("Updated design:", updatedDesign);
    handleDesignUpdate(updatedDesign);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setLeftDrawerOpen(false);
    setRightDrawerOpen(false);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    loadDesigns(page, pagination.limit);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Tooltip title="Toggle Room Controls">
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {currentDesign?.name || "New Design"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Open Designs">
              <IconButton
                color="inherit"
                onClick={() => setDesignsDrawerOpen(true)}
              >
                <FolderIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Design">
              <IconButton color="inherit" onClick={handleNewDesign}>
                <FolderIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save Design">
              <IconButton
                color="inherit"
                onClick={() => setSaveDialogOpen(true)}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                viewMode === "2d" ? "Switch to 3D View" : "Switch to 2D View"
              }
            >
              <IconButton
                onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
                color="inherit"
              >
                {viewMode === "2d" ? <ViewInArIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Furniture Catalog">
              <IconButton
                onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Shopping Cart">
              <IconButton
                color="inherit"
                onClick={() => setCartDrawerOpen(true)}
              >
                <Badge badgeContent={items?.length ?? 0} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexGrow: 1, position: "relative" }}>
        {!isFullScreen && (
          <>
            <Drawer
              anchor="left"
              variant="persistent"
              open={leftDrawerOpen}
              PaperProps={{
                sx: {
                  width: 300,
                  bgcolor: theme.palette.background.paper,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  height: "calc(100% - 64px)",
                  top: 64,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Room Settings
                </Typography>
                {currentDesign && (
                  <RoomDesigner
                    initialDesign={currentDesign}
                    onDesignChange={handleDesignUpdate}
                    selectedElement={selectedElement}
                    onUpdateElement={handleElementUpdate}
                    onElementRemove={handleElementRemove}
                  />
                )}
              </Box>
            </Drawer>

            <Box
              sx={{
                flexGrow: 1,
                height: "calc(100vh - 64px)",
                ml: leftDrawerOpen ? "300px" : 0,
                mr: rightDrawerOpen ? "280px" : 0,
                transition: "margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
              }}
            >
              <DesignViewer
                design={currentDesign}
                viewMode={viewMode}
                selectedElement={selectedElement}
                onElementSelect={handleElementSelect}
                onUpdateElement={handleElementUpdate}
              />
            </Box>

            <Drawer
              anchor="right"
              variant="persistent"
              open={rightDrawerOpen}
              PaperProps={{
                sx: {
                  width: 280,
                  bgcolor: theme.palette.background.paper,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  height: "calc(100% - 64px)",
                  top: 64,
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Furniture Catalog
                </Typography>
                <FurniturePicker onSelectFurniture={handleFurnitureSelect} />
              </Box>
            </Drawer>
          </>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 350,
            bgcolor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <ShoppingCart />
      </Drawer>

      <Drawer
        anchor="left"
        open={designsDrawerOpen}
        onClose={() => setDesignsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            My Designs
          </Typography>
          <List sx={{ flexGrow: 1, overflow: "auto" }}>
            {loading ? (
              <ListItem>
                <ListItemText primary="Loading designs..." />
              </ListItem>
            ) : designs.length === 0 ? (
              <ListItem>
                <ListItemText primary="No designs found" />
              </ListItem>
            ) : (
              designs.map((design) => (
                <ListItem
                  key={design.id}
                  button
                  selected={currentDesign?.id === design.id}
                  onClick={() => {
                    setCurrentDesign(design);
                    setDesignsDrawerOpen(false);
                  }}
                >
                  <ListItemText
                    primary={design.name}
                    secondary={new Date(design.updatedAt).toLocaleDateString()}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteDesign(design.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
          {pagination.totalPages > 1 && (
            <Box
              sx={{ pt: 2, pb: 2, display: "flex", justifyContent: "center" }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Box>
      </Drawer>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>
          {currentDesign?.id === "new-design" ? "Save Design" : "Update Design"}
        </DialogTitle>
        <DialogContent>
          {currentDesign?.id === "new-design" && (
            <TextField
              autoFocus
              margin="dense"
              label="Design Name"
              fullWidth
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveDesign}
            variant="contained"
            color="primary"
          >
            {currentDesign?.id === "new-design" ? "Save" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DesignerDashboard = () => {
  return (
    <DesignProvider>
      <DesignerDashboardContent />
    </DesignProvider>
  );
};

export default DesignerDashboard;
