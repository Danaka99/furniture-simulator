import React from "react";
import { IconButton } from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  ThreeDRotation,
} from "@mui/icons-material";
import "./RoomViewer.css";

interface RoomViewerProps {
  viewMode: "2D" | "3D";
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  onRotate?: () => void;
}

const RoomViewer: React.FC<RoomViewerProps> = ({
  viewMode,
  onZoomIn,
  onZoomOut,
  onCenter,
  onRotate,
}) => {
  return (
    <div className="room-viewer">
      <div className="viewer-toolbar">
        <IconButton className="viewer-button" onClick={onZoomIn}>
          <ZoomIn />
        </IconButton>
        <IconButton className="viewer-button" onClick={onZoomOut}>
          <ZoomOut />
        </IconButton>
        <IconButton className="viewer-button" onClick={onCenter}>
          <CenterFocusStrong />
        </IconButton>
        {viewMode === "3D" && (
          <IconButton className="viewer-button" onClick={onRotate}>
            <ThreeDRotation />
          </IconButton>
        )}
      </div>
      <div className="grid-overlay" />
      <div className="axis-helper">
        <div className="axis axis-x">X</div>
        <div className="axis axis-y">Y</div>
        <div className="axis axis-z">Z</div>
      </div>
    </div>
  );
};

export default RoomViewer;
