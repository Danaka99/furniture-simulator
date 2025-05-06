import React, { createContext, useContext, useState, useEffect } from "react";
import { Design } from "../types/design";
import { designService } from "../services/designService";
import { useAuth } from "./AuthContext";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DesignContextType {
  designs: Design[];
  currentDesign: Design | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  saveDesign: (design: Design) => Promise<void>;
  updateDesign: (design: Design) => Promise<void>;
  deleteDesign: (designId: string) => Promise<void>;
  loadDesigns: (page?: number, limit?: number) => Promise<void>;
  setCurrentDesign: (design: Design | null) => void;
  createNewDesign: () => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

// Default design template
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

const defaultPagination: PaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(
    defaultDesign
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationState>(defaultPagination);
  const { isAuthenticated } = useAuth();

  const loadDesigns = async (page: number = 1, limit: number = 10) => {
    if (!isAuthenticated) {
      setCurrentDesign(defaultDesign);
      setDesigns([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("DesignContext: Loading designs...");
      const response = await designService.getAllDesigns(page, limit);
      console.log("DesignContext: Received designs:", response);

      if (!response || !Array.isArray(response.data)) {
        console.error("DesignContext: Invalid response data:", response);
        setDesigns([]);
        setPagination(defaultPagination);
      } else {
        // Normalize IDs in the loaded designs
        const normalizedDesigns = response.data.map((design) => ({
          ...design,
          id: design.id || (design as any)._id,
        }));

        console.log(
          "DesignContext: Setting normalized designs:",
          normalizedDesigns
        );
        setDesigns(normalizedDesigns);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      }

      // Only reset current design if it's not set or is a new design
      if (!currentDesign || currentDesign.id === "new-design") {
        setCurrentDesign(defaultDesign);
      }
    } catch (err) {
      console.error("DesignContext: Error loading designs:", err);
      setError("Failed to load designs");
      setDesigns([]);
      setCurrentDesign(defaultDesign);
      setPagination(defaultPagination);
    } finally {
      setLoading(false);
    }
  };

  // Load designs when authentication state changes
  useEffect(() => {
    console.log("DesignContext: Auth state changed, loading designs...");
    loadDesigns();
  }, [isAuthenticated]);

  const createNewDesign = () => {
    const newDesign = {
      ...defaultDesign,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentDesign(newDesign);
  };

  const saveDesign = async (design: Design) => {
    if (!isAuthenticated) {
      setError("Please log in to save designs");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("DesignContext: Saving new design:", design);
      const savedDesign = await designService.saveDesign(design);
      if (!savedDesign) {
        throw new Error("Failed to save design: No response from server");
      }

      // Ensure the saved design has the correct id field
      const normalizedSavedDesign: Design = {
        ...savedDesign,
        id: savedDesign.id || (savedDesign as any)._id,
      };

      console.log(
        "DesignContext: Design saved successfully:",
        normalizedSavedDesign
      );

      // Update the designs list with the new design
      setDesigns((prev) => {
        const currentDesigns = Array.isArray(prev) ? prev : [];
        // Remove any existing design with the same ID (shouldn't happen for new designs)
        const filteredDesigns = currentDesigns.filter(
          (d) => d.id !== normalizedSavedDesign.id
        );
        return [...filteredDesigns, normalizedSavedDesign];
      });

      // Set the saved design as current
      setCurrentDesign(normalizedSavedDesign);

      // Refresh the designs list to get the updated pagination
      console.log("DesignContext: Refreshing designs after save...");
      await loadDesigns(1, pagination.limit); // Go to first page after saving
    } catch (err) {
      console.error("DesignContext: Error saving design:", err);
      setError("Failed to save design");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDesign = async (design: Design) => {
    if (!isAuthenticated) {
      setError("Please log in to update designs");
      return;
    }

    // Check for either id or _id
    const designId = design.id || (design as any)._id;
    if (!designId || designId === "new-design") {
      console.error(
        "DesignContext: Cannot update design without valid ID:",
        design
      );
      setError("Invalid design ID");
      throw new Error("Cannot update design without valid ID");
    }

    // Create a normalized design object with the correct id field
    const normalizedDesign: Design = {
      ...design,
      id: designId,
    };

    setLoading(true);
    setError(null);
    try {
      console.log("DesignContext: Updating design:", normalizedDesign);
      const updatedDesign = await designService.updateDesign(normalizedDesign);
      if (!updatedDesign) {
        throw new Error("Failed to update design: No response from server");
      }

      // Ensure the updated design has the correct id field
      const normalizedUpdatedDesign: Design = {
        ...updatedDesign,
        id: updatedDesign.id || (updatedDesign as any)._id,
      };

      console.log(
        "DesignContext: Design updated successfully:",
        normalizedUpdatedDesign
      );

      // Update the designs list
      setDesigns((prev) => {
        const currentDesigns = Array.isArray(prev) ? prev : [];
        return currentDesigns.map((d) =>
          d.id === normalizedUpdatedDesign.id ? normalizedUpdatedDesign : d
        );
      });

      // Update current design if it's the one being edited
      if (currentDesign?.id === normalizedUpdatedDesign.id) {
        setCurrentDesign(normalizedUpdatedDesign);
      }

      // No need to refresh the whole list for updates
    } catch (err) {
      console.error("DesignContext: Error updating design:", err);
      setError("Failed to update design");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDesign = async (designId: string) => {
    if (!isAuthenticated) {
      setError("Please log in to delete designs");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await designService.deleteDesign(designId);

      setDesigns((prev) => {
        const currentDesigns = Array.isArray(prev) ? prev : [];
        return currentDesigns.filter((d) => d.id !== designId);
      });

      if (currentDesign?.id === designId) {
        setCurrentDesign(defaultDesign);
      }

      // Refresh the designs list to get the updated pagination
      await loadDesigns(pagination.page, pagination.limit);
    } catch (err) {
      console.error("Error deleting design:", err);
      setError("Failed to delete design");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesignContext.Provider
      value={{
        designs,
        currentDesign,
        loading,
        error,
        pagination,
        saveDesign,
        updateDesign,
        deleteDesign,
        loadDesigns,
        setCurrentDesign,
        createNewDesign,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error("useDesign must be used within a DesignProvider");
  }
  return context;
};
