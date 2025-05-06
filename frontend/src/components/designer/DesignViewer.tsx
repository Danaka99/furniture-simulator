import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { Design, DesignElement, Room } from "../../types/design";
import ModelLoader from "../../utils/ModelLoader";
import { FURNITURE_CATALOG } from "../../types/furniture";

interface DesignViewerProps {
  design: Design | null;
  viewMode: "2d" | "3d";
  selectedElement: string | null;
  onElementSelect: (elementId: string | null) => void;
  onUpdateElement?: (
    elementId: string,
    updates: Partial<DesignElement>
  ) => void;
}

function getInitialPosition(element: DesignElement, room: Room) {
  // Center the element in the room by default
  return {
    x: room.width * element.position.x - room.width / 2,
    y: element.position.y,
    z: room.length * element.position.z - room.length / 2,
  };
}

const DesignViewer: React.FC<DesignViewerProps> = ({
  design,
  viewMode,
  selectedElement,
  onElementSelect,
  onUpdateElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const furnitureMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const dragControlsRef = useRef<DragControls | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!design || !containerRef.current) return;

    // Cleanup previous renderer and scene
    const cleanup = () => {
      if (rendererRef.current && containerRef.current) {
        rendererRef.current.dispose();
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      if (orbitControlsRef.current) {
        orbitControlsRef.current.dispose();
        orbitControlsRef.current = null;
      }
      if (dragControlsRef.current) {
        dragControlsRef.current.dispose();
        dragControlsRef.current = null;
      }
      // Clear any existing canvases
      if (containerRef.current) {
        const existingCanvas = containerRef.current.querySelector("canvas");
        if (existingCanvas) {
          containerRef.current.removeChild(existingCanvas);
        }
      }
    };

    // Clean up before initializing new view
    cleanup();

    if (viewMode === "3d") {
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 5, 5);
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true,
      });
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Add room
      const roomGeometry = new THREE.BoxGeometry(
        design.room.width,
        design.room.height,
        design.room.length
      );
      const roomMaterial = new THREE.MeshStandardMaterial({
        color: design.room.colorScheme.walls,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        depthTest: true,
        alphaTest: 0.1,
      });
      const room = new THREE.Mesh(roomGeometry, roomMaterial);
      // Set room position to start from y=0 (floor level)
      room.position.set(0, design.room.height / 2, 0);
      room.receiveShadow = true;
      room.renderOrder = -1;
      scene.add(room);

      // Add floor at y=0
      const floorGeometry = new THREE.PlaneGeometry(
        design.room.width,
        design.room.length
      );
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: design.room.colorScheme.floor,
        roughness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0; // Ensure floor is at y=0
      floor.receiveShadow = true;
      scene.add(floor);

      // Add grid helper
      const gridHelper = new THREE.GridHelper(
        Math.max(design.room.width, design.room.length),
        10,
        0x000000,
        0x444444
      );
      gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
      scene.add(gridHelper);

      // Load furniture models
      const modelLoader = ModelLoader.getInstance();
      furnitureMeshesRef.current.clear();

      Promise.all(
        design.elements.map(async (element) => {
          const furnitureTemplate = FURNITURE_CATALOG.find(
            (f) => f.category.toLowerCase() === element.type
          );
          if (!furnitureTemplate) return;

          try {
            const model = await modelLoader.loadModel(
              furnitureTemplate.modelPath
            );

            // Convert normalized coordinates to world coordinates
            const worldX =
              element.position.x * design.room.width - design.room.width / 2;
            const worldZ =
              element.position.z * design.room.length - design.room.length / 2;

            // First set initial position at origin
            model.position.set(0, 0, 0);
            model.rotation.set(0, element.rotation.y, 0);
            model.scale.set(element.scale.x, element.scale.y, element.scale.z);

            // Update matrices to ensure correct bounding box calculation
            model.updateMatrix();
            model.updateMatrixWorld(true);

            // Calculate bounding box
            const bbox = new THREE.Box3().setFromObject(model);
            const height = bbox.max.y - bbox.min.y;

            // Move all geometry up so bottom is at y=0
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const geometry = child.geometry;
                geometry.computeBoundingBox();
                const bottomY = geometry.boundingBox!.min.y;

                // Translate geometry up by its bottom offset
                geometry.translate(0, -bottomY, 0);
                geometry.computeBoundingBox(); // Recompute after translation
              }
            });

            // Now set final world position
            model.position.set(worldX, 0, worldZ);

            // Update matrices again
            model.updateMatrix();
            model.updateMatrixWorld(true);

            // Apply materials with proper depth handling
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const isSelected = element.id === selectedElement;

                // Create material for the furniture
                const baseMaterial = new THREE.MeshPhongMaterial({
                  color: isSelected ? 0xff4444 : element.color,
                  transparent: isSelected,
                  opacity: 1,
                  depthTest: true,
                  depthWrite: true,
                  emissive: isSelected ? 0xff0000 : 0x000000,
                  emissiveIntensity: isSelected ? 0.5 : 0,
                  shininess: isSelected ? 100 : 30,
                });

                child.material = baseMaterial;
                child.castShadow = true;
                child.receiveShadow = true;

                if (isSelected) {
                  // Force selected objects to render last and always be visible
                  child.renderOrder = 999;
                  baseMaterial.polygonOffset = true;
                  baseMaterial.polygonOffsetFactor = -1.0;
                  baseMaterial.needsUpdate = true;

                  // Add edge highlighting
                  const edges = new THREE.EdgesGeometry(child.geometry);
                  const edgeMaterial = new THREE.LineBasicMaterial({
                    color: 0xff0000,
                    linewidth: 2,
                    transparent: true,
                    opacity: 1,
                    depthTest: false,
                  });
                  const wireframe = new THREE.LineSegments(edges, edgeMaterial);
                  wireframe.renderOrder = 1000; // Render edges after everything
                  child.add(wireframe);
                }
              }
            });

            // Remove any existing bbox helpers
            scene.traverse((object) => {
              if (
                object instanceof THREE.Box3Helper ||
                object instanceof THREE.LineSegments
              ) {
                scene.remove(object);
              }
            });

            // Add bounding box for selected element
            if (element.id === selectedElement) {
              const bbox = new THREE.Box3().setFromObject(model);
              const bboxHelper = new THREE.Box3Helper(
                bbox,
                new THREE.Color(0xff0000)
              );
              if (bboxHelper.material instanceof THREE.Material) {
                bboxHelper.material.transparent = true;
                bboxHelper.material.opacity = 1;
                bboxHelper.material.depthTest = false;
                bboxHelper.material.depthWrite = false;
                bboxHelper.material.needsUpdate = true;
              }
              bboxHelper.renderOrder = 1001; // Render bbox last
              scene.add(bboxHelper);
            }

            model.userData.elementId = element.id;
            scene.add(model);
            furnitureMeshesRef.current.set(element.id, model);
          } catch (error) {
            console.error(`Failed to load model for ${element.type}:`, error);
          }
        })
      );

      // Setup OrbitControls
      const orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.05;
      orbitControls.minDistance = 2;
      orbitControls.maxDistance = 20;
      orbitControls.maxPolarAngle = Math.PI / 2;
      orbitControls.target.set(0, 0, 0);
      orbitControlsRef.current = orbitControls;

      // Setup DragControls
      const draggableObjects = Array.from(furnitureMeshesRef.current.values());
      const dragControls = new DragControls(
        draggableObjects,
        camera,
        renderer.domElement
      );
      dragControlsRef.current = dragControls;

      dragControls.addEventListener("dragstart", (event) => {
        orbitControls.enabled = false;
        setIsDragging(true);
        const furniture = event.object;
        if (furniture.userData.elementId) {
          onElementSelect(furniture.userData.elementId);
        }
      });

      dragControls.addEventListener("drag", (event) => {
        const furniture = event.object;
        const elementId = furniture.userData.elementId;
        if (!elementId || !onUpdateElement) return;

        // Get room boundaries
        const halfWidth = design.room.width / 2;
        const halfLength = design.room.length / 2;

        // Clamp position within room boundaries
        const x = Math.max(
          -halfWidth,
          Math.min(halfWidth, furniture.position.x)
        );
        const z = Math.max(
          -halfLength,
          Math.min(halfLength, furniture.position.z)
        );

        // Maintain the original y position
        const y = furniture.position.y;
        furniture.position.set(x, y, z);

        // Convert world coordinates to normalized coordinates (0-1)
        const normalizedX = (x + halfWidth) / design.room.width;
        const normalizedZ = (z + halfLength) / design.room.length;

        onUpdateElement(elementId, {
          position: {
            x: normalizedX,
            y: 0, // Keep y position normalized
            z: normalizedZ,
          },
        });
      });

      dragControls.addEventListener("dragend", () => {
        orbitControls.enabled = true;
        setIsDragging(false);
      });

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        orbitControls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Add click event listener for 3D mode
      const handleClick = (event: MouseEvent) => {
        if (isDragging || !sceneRef.current || !cameraRef.current) return;

        const rect = containerRef.current!.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y =
          -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        // Get all furniture objects
        const furnitureObjects: THREE.Object3D[] = [];
        sceneRef.current.traverse((child) => {
          if (child instanceof THREE.Group && child.userData.elementId) {
            furnitureObjects.push(child);
          }
        });

        const intersects = raycasterRef.current.intersectObjects(
          furnitureObjects,
          true
        );

        if (intersects.length > 0) {
          // Find the first intersected object that has an elementId
          let selectedObject = intersects[0].object;
          while (selectedObject && !selectedObject.userData.elementId) {
            selectedObject = selectedObject.parent!;
          }

          if (selectedObject && selectedObject.userData.elementId) {
            onElementSelect(selectedObject.userData.elementId);
          }
        } else {
          onElementSelect(null);
        }
      };

      containerRef.current.addEventListener("click", handleClick);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        scene.clear();
        if (containerRef.current) {
          containerRef.current.removeEventListener("click", handleClick);
        }
      };
    } else {
      // 2D rendering
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      containerRef.current.appendChild(canvas);

      // Calculate scale factor
      const scale =
        Math.min(
          canvas.width / design.room.width,
          canvas.height / design.room.length
        ) * 0.8;

      // Clear canvas
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw room
      ctx.fillStyle = design.room.colorScheme.floor;
      ctx.fillRect(
        (canvas.width - design.room.width * scale) / 2,
        (canvas.height - design.room.length * scale) / 2,
        design.room.width * scale,
        design.room.length * scale
      );

      // Draw grid
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      const gridSize = 0.5; // 0.5m grid
      for (let x = 0; x <= design.room.width; x += gridSize) {
        const px = (canvas.width - design.room.width * scale) / 2 + x * scale;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= design.room.length; y += gridSize) {
        const py = (canvas.height - design.room.length * scale) / 2 + y * scale;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
        ctx.stroke();
      }

      // Draw furniture
      design.elements.forEach((element) => {
        const furnitureTemplate = FURNITURE_CATALOG.find(
          (f) => f.category.toLowerCase() === element.type
        );
        if (!furnitureTemplate) return;

        // Calculate dimensions and position
        const width =
          furnitureTemplate.defaultDimensions.width * scale * element.scale.x;
        const height =
          furnitureTemplate.defaultDimensions.length * scale * element.scale.z;
        const x =
          (canvas.width - design.room.width * scale) / 2 +
          element.position.x * design.room.width * scale;
        const y =
          (canvas.height - design.room.length * scale) / 2 +
          element.position.z * design.room.length * scale;

        // Draw furniture
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(element.rotation.y);

        // Fill and stroke
        ctx.fillStyle = element.color;
        ctx.fillRect(-width / 2, -height / 2, width, height);

        // Highlight selected element
        if (element.id === selectedElement) {
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        }

        // Draw label
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(furnitureTemplate.name, 0, 0);

        ctx.restore();
      });

      // Add click handler for 2D view
      const handleClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert to room coordinates
        const roomX =
          (x - (canvas.width - design.room.width * scale) / 2) / scale;
        const roomZ =
          (y - (canvas.height - design.room.length * scale) / 2) / scale;

        // Check if click is within room bounds
        if (
          roomX >= 0 &&
          roomX <= design.room.width &&
          roomZ >= 0 &&
          roomZ <= design.room.length
        ) {
          // Find clicked furniture
          let clickedElement: string | null = null;
          design.elements.forEach((element) => {
            const elementX = element.position.x * design.room.width * scale;
            const elementZ = element.position.z * design.room.length * scale;
            // Add click detection logic here
            // ...
          });
          onElementSelect(clickedElement);
        }
      };

      canvas.addEventListener("click", handleClick);

      return () => {
        canvas.removeEventListener("click", handleClick);
        cleanup();
      };
    }

    return cleanup;
  }, [design, viewMode, selectedElement, onElementSelect]);

  useEffect(() => {
    if (!design || !containerRef.current) return;

    // Handle resize for both 2D and 3D modes
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Update 3D view
      if (viewMode === "3d" && rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      // Update 2D view
      else if (viewMode === "2d") {
        const canvas = containerRef.current.querySelector("canvas");
        if (canvas && canvas.getContext("2d")) {
          canvas.width = width;
          canvas.height = height;
          // Redraw 2D view with new dimensions
          const ctx = canvas.getContext("2d")!;
          const scale =
            Math.min(width / design.room.width, height / design.room.length) *
            0.8;

          // Clear and redraw
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(0, 0, width, height);

          // Draw room
          ctx.fillStyle = design.room.colorScheme.floor;
          ctx.fillRect(
            (width - design.room.width * scale) / 2,
            (height - design.room.length * scale) / 2,
            design.room.width * scale,
            design.room.length * scale
          );

          // Redraw furniture
          design.elements.forEach((element) => {
            const furnitureTemplate = FURNITURE_CATALOG.find(
              (f) => f.category.toLowerCase() === element.type
            );
            if (!furnitureTemplate) return;

            const elementWidth =
              furnitureTemplate.defaultDimensions.width *
              scale *
              element.scale.x;
            const elementLength =
              furnitureTemplate.defaultDimensions.length *
              scale *
              element.scale.z;
            const x =
              (width - design.room.width * scale) / 2 +
              element.position.x * design.room.width * scale;
            const y =
              (height - design.room.length * scale) / 2 +
              element.position.z * design.room.length * scale;

            ctx.save();
            ctx.translate(x + elementWidth / 2, y + elementLength / 2);
            ctx.rotate(element.rotation.y);

            // Draw furniture
            ctx.fillStyle = element.color;
            ctx.fillRect(
              -elementWidth / 2,
              -elementLength / 2,
              elementWidth,
              elementLength
            );

            // Highlight selected furniture
            if (element.id === selectedElement) {
              ctx.strokeStyle = "#ff0000";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                -elementWidth / 2,
                -elementLength / 2,
                elementWidth,
                elementLength
              );
            }

            ctx.restore();
          });
        }
      }
    };

    // Add resize event listeners
    window.addEventListener("resize", handleResize);

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      handleResize();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Initial resize
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [design, viewMode, selectedElement]);

  // Add fullscreen toggle function
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  if (!design) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight={400}
      >
        <Typography variant="body1">No design selected</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 500,
        bgcolor: "#f5f5f5",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        "& canvas": {
          width: "100% !important",
          height: "100% !important",
          maxWidth: "none !important",
          maxHeight: "none !important",
        },
      }}
    >
      {/* Add fullscreen toggle button */}
      <IconButton
        onClick={toggleFullscreen}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
          zIndex: 1000,
        }}
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
      {!design && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          minHeight={400}
        >
          <Typography variant="body1">No design selected</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DesignViewer;
