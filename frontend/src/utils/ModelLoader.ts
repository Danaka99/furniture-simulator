import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

class ModelLoader {
    private static instance: ModelLoader;
    private loader: GLTFLoader;
    private dracoLoader: DRACOLoader;
    private cache: Map<string, THREE.Group>;
    private loadingPromises: Map<string, Promise<THREE.Group>>;

    private constructor() {
        // Initialize DRACO loader
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.dracoLoader.setWorkerLimit(2);

        // Initialize GLTF loader
        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(this.dracoLoader);

        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    public static getInstance(): ModelLoader {
        if (!ModelLoader.instance) {
            ModelLoader.instance = new ModelLoader();
        }
        return ModelLoader.instance;
    }

    public async loadModel(path: string): Promise<THREE.Group> {
        console.log('Loading model from path:', path);

        // If model is already cached, return a clone
        if (this.cache.has(path)) {
            console.log('Model found in cache:', path);
            return this.cache.get(path)!.clone();
        }

        // If model is currently loading, return the existing promise
        if (this.loadingPromises.has(path)) {
            console.log('Model is already loading:', path);
            return (await this.loadingPromises.get(path))!.clone();
        }

        // Create new loading promise
        const loadingPromise = new Promise<THREE.Group>((resolve, reject) => {
            console.log('Starting to load model:', path);

            this.loader.load(
                path,
                (gltf) => {
                    console.log('Model loaded successfully:', path);
                    const model = gltf.scene;

                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);

                    // Normalize scale if needed
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 10) {
                        const scale = 1 / maxDim;
                        model.scale.multiplyScalar(scale);
                    }

                    // Store in cache
                    this.cache.set(path, model);
                    resolve(model.clone());
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(2);
                    console.log(`Loading progress for ${path}: ${percent}%`);
                },
                (error) => {
                    console.error('Error loading model:', path, error);
                    reject(error);
                }
            );
        });

        // Store the loading promise
        this.loadingPromises.set(path, loadingPromise);

        try {
            return await loadingPromise;
        } catch (error) {
            console.error('Failed to load model:', path, error);
            // Create and return a default cube as fallback
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.7,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            const group = new THREE.Group();
            group.add(mesh);
            return group;
        } finally {
            // Clean up the loading promise
            this.loadingPromises.delete(path);
        }
    }

    public clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}

export default ModelLoader; 