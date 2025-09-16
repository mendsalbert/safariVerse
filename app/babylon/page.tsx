"use client";

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/core/Materials/Node/Blocks";
import { ArrowLeft, Users, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BabylonMMO() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const router = useRouter();
  const [fps, setFps] = useState(0);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
    engineRef.current = engine;

    const createScene = async () => {
      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;
      scene.collisionsEnabled = true;
      scene.gravity = new BABYLON.Vector3(0, -0.15, 0);

      // Enhanced Camera with smooth follow
      const cameraTarget = new BABYLON.TransformNode("cameraTarget", scene);
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        0,
        Math.PI / 3,
        12,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.attachControl(canvas, true);
      camera.setTarget(cameraTarget.position);
      camera.lowerRadiusLimit = 3;
      camera.upperRadiusLimit = 20;
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI / 2;

      // Golden Sunset Lighting System
      const hemi = new BABYLON.HemisphericLight(
        "hemi",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      hemi.intensity = 0.6;
      hemi.diffuse = new BABYLON.Color3(1.0, 0.7, 0.4); // Warm golden light
      hemi.specular = new BABYLON.Color3(1.0, 0.8, 0.5);

      const sun = new BABYLON.DirectionalLight(
        "sun",
        new BABYLON.Vector3(-0.5, -0.8, 0.3),
        scene
      );
      sun.intensity = 2.0;
      sun.diffuse = new BABYLON.Color3(1.0, 0.6, 0.2); // Orange sunset light
      sun.specular = new BABYLON.Color3(1.0, 0.8, 0.4);

      // Additional warm fill light
      const fillLight = new BABYLON.DirectionalLight(
        "fillLight",
        new BABYLON.Vector3(0.3, -0.5, -0.8),
        scene
      );
      fillLight.intensity = 0.8;
      fillLight.diffuse = new BABYLON.Color3(0.9, 0.5, 0.3);

      // Simplified shadows to avoid mesh.getBoundingInfo errors
      const shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);
      shadowGenerator.usePercentageCloserFiltering = false;
      shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW;

      // Golden Sunset Skybox
      const skybox = BABYLON.MeshBuilder.CreateSphere(
        "skyBox",
        { diameter: 1000 },
        scene
      );
      const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.6, 0.2); // Golden orange
      skyboxMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0.1); // Warm glow
      skybox.material = skyboxMaterial;
      skybox.infiniteDistance = true;

      // Add dynamic sunset gradient
      const sunsetGradient = BABYLON.MeshBuilder.CreateSphere(
        "sunsetGradient",
        { diameter: 800 },
        scene
      );
      const gradientMaterial = new BABYLON.StandardMaterial(
        "gradientMat",
        scene
      );
      gradientMaterial.backFaceCulling = false;
      gradientMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.1);
      gradientMaterial.emissiveColor = new BABYLON.Color3(0.6, 0.2, 0.05);
      gradientMaterial.alpha = 0.3;
      sunsetGradient.material = gradientMaterial;
      sunsetGradient.infiniteDistance = true;

      // Realistic Terrain with Height Map
      const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        {
          width: 300,
          height: 300,
          subdivisions: 100,
          minHeight: 0,
          maxHeight: 15,
        },
        scene
      );

      // Advanced Ground Material with PBR
      const groundMaterial = new BABYLON.PBRMaterial("groundMat", scene);
      groundMaterial.albedoColor = new BABYLON.Color3(0.2, 0.4, 0.1);
      groundMaterial.roughness = 0.9;
      groundMaterial.metallic = 0.1;
      ground.material = groundMaterial;
      ground.checkCollisions = true;
      ground.receiveShadows = true;

      // Create realistic Safari Vehicle
      let safariCar: BABYLON.AbstractMesh;

      try {
        // First try loading the local Humvee GLB used elsewhere in the app
        const humvee = await BABYLON.SceneLoader.ImportMeshAsync(
          "",
          "/newenv/",
          "Humvee.glb",
          scene
        );
        const root = BABYLON.MeshBuilder.CreateBox(
          "humveeRoot",
          { size: 0.001 },
          scene
        );
        root.visibility = 0;
        root.isPickable = false;
        humvee.meshes.forEach((m) => {
          if (m !== root) m.parent = root;
        });
        safariCar = root as BABYLON.AbstractMesh;
        safariCar.name = "safariCar";
        safariCar.scaling = new BABYLON.Vector3(2.2, 2.2, 2.2);
      } catch (e1) {
        try {
          // Try remote demo buggy as a secondary option
          const result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "https://models.babylonjs.com/",
            "buggy.babylon",
            scene
          );
          safariCar = result.meshes[0] as BABYLON.AbstractMesh;
          safariCar.name = "safariCar";
          safariCar.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        } catch (error) {
          // Fallback: Create a highly detailed safari vehicle
          const carBody = BABYLON.MeshBuilder.CreateBox(
            "carBody",
            { width: 4.5, height: 1.8, depth: 2.5 },
            scene
          );
          const carMat = new BABYLON.PBRMaterial("carMat", scene);
          carMat.albedoColor = new BABYLON.Color3(0.15, 0.35, 0.08); // Deep safari green
          carMat.roughness = 0.4;
          carMat.metallic = 0.9;
          // Enhanced metallic finish for realistic car paint
          carBody.material = carMat;
          carBody.position.y = 1.2;

          // Add realistic car details
          // Front bumper
          const frontBumper = BABYLON.MeshBuilder.CreateBox(
            "frontBumper",
            { width: 4.6, height: 0.3, depth: 0.2 },
            scene
          );
          frontBumper.position = new BABYLON.Vector3(0, 0.5, 1.4);
          frontBumper.parent = carBody;
          const bumperMat = new BABYLON.PBRMaterial("bumperMat", scene);
          bumperMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
          bumperMat.roughness = 0.8;
          bumperMat.metallic = 0.3;
          frontBumper.material = bumperMat;

          // Rear bumper
          const rearBumper = BABYLON.MeshBuilder.CreateBox(
            "rearBumper",
            { width: 4.6, height: 0.3, depth: 0.2 },
            scene
          );
          rearBumper.position = new BABYLON.Vector3(0, 0.5, -1.4);
          rearBumper.parent = carBody;
          rearBumper.material = bumperMat;

          // Hood
          const hood = BABYLON.MeshBuilder.CreateBox(
            "hood",
            { width: 4.2, height: 0.1, depth: 1.5 },
            scene
          );
          hood.position = new BABYLON.Vector3(0, 0.95, 0.5);
          hood.parent = carBody;
          hood.material = carMat;

          // Side panels with realistic dents/details
          const leftPanel = BABYLON.MeshBuilder.CreateBox(
            "leftPanel",
            { width: 0.1, height: 1.5, depth: 2.3 },
            scene
          );
          leftPanel.position = new BABYLON.Vector3(-2.3, 0, 0);
          leftPanel.parent = carBody;
          leftPanel.material = carMat;

          const rightPanel = BABYLON.MeshBuilder.CreateBox(
            "rightPanel",
            { width: 0.1, height: 1.5, depth: 2.3 },
            scene
          );
          rightPanel.position = new BABYLON.Vector3(2.3, 0, 0);
          rightPanel.parent = carBody;
          rightPanel.material = carMat;

          // Car roof/canopy
          const roof = BABYLON.MeshBuilder.CreateBox(
            "roof",
            { width: 3.5, height: 0.1, depth: 1.8 },
            scene
          );
          roof.position = new BABYLON.Vector3(0, 2, 0);
          roof.parent = carBody;
          const roofMat = new BABYLON.PBRMaterial("roofMat", scene);
          roofMat.albedoColor = new BABYLON.Color3(0.8, 0.7, 0.5); // Canvas color
          roofMat.roughness = 0.8;
          roof.material = roofMat;

          // Support pillars
          const pillar1 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar1",
            { height: 1.2, diameter: 0.1 },
            scene
          );
          pillar1.position = new BABYLON.Vector3(1.5, 0.6, 0.8);
          pillar1.parent = carBody;
          pillar1.material = carMat;

          const pillar2 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar2",
            { height: 1.2, diameter: 0.1 },
            scene
          );
          pillar2.position = new BABYLON.Vector3(1.5, 0.6, -0.8);
          pillar2.parent = carBody;
          pillar2.material = carMat;

          const pillar3 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar3",
            { height: 1.2, diameter: 0.1 },
            scene
          );
          pillar3.position = new BABYLON.Vector3(-1.5, 0.6, 0.8);
          pillar3.parent = carBody;
          pillar3.material = carMat;

          const pillar4 = BABYLON.MeshBuilder.CreateCylinder(
            "pillar4",
            { height: 1.2, diameter: 0.1 },
            scene
          );
          pillar4.position = new BABYLON.Vector3(-1.5, 0.6, -0.8);
          pillar4.parent = carBody;
          pillar4.material = carMat;

          // Wheels
          const wheelMat = new BABYLON.PBRMaterial("wheelMat", scene);
          wheelMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
          wheelMat.roughness = 0.9;

          const wheel1 = BABYLON.MeshBuilder.CreateCylinder(
            "wheel1",
            { height: 0.4, diameter: 1.2 },
            scene
          );
          wheel1.position = new BABYLON.Vector3(1.3, 0.2, 1.2);
          wheel1.rotation.z = Math.PI / 2;
          wheel1.parent = carBody;
          wheel1.material = wheelMat;

          const wheel2 = BABYLON.MeshBuilder.CreateCylinder(
            "wheel2",
            { height: 0.4, diameter: 1.2 },
            scene
          );
          wheel2.position = new BABYLON.Vector3(1.3, 0.2, -1.2);
          wheel2.rotation.z = Math.PI / 2;
          wheel2.parent = carBody;
          wheel2.material = wheelMat;

          const wheel3 = BABYLON.MeshBuilder.CreateCylinder(
            "wheel3",
            { height: 0.4, diameter: 1.2 },
            scene
          );
          wheel3.position = new BABYLON.Vector3(-1.3, 0.2, 1.2);
          wheel3.rotation.z = Math.PI / 2;
          wheel3.parent = carBody;
          wheel3.material = wheelMat;

          const wheel4 = BABYLON.MeshBuilder.CreateCylinder(
            "wheel4",
            { height: 0.4, diameter: 1.2 },
            scene
          );
          wheel4.position = new BABYLON.Vector3(-1.3, 0.2, -1.2);
          wheel4.rotation.z = Math.PI / 2;
          wheel4.parent = carBody;
          wheel4.material = wheelMat;

          // Headlights
          const headlight1 = BABYLON.MeshBuilder.CreateSphere(
            "headlight1",
            { diameter: 0.3 },
            scene
          );
          headlight1.position = new BABYLON.Vector3(2.1, 0.8, 0.5);
          headlight1.parent = carBody;
          const lightMat = new BABYLON.PBRMaterial("lightMat", scene);
          lightMat.albedoColor = new BABYLON.Color3(1, 1, 0.8);
          lightMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.1);
          headlight1.material = lightMat;

          const headlight2 = BABYLON.MeshBuilder.CreateSphere(
            "headlight2",
            { diameter: 0.3 },
            scene
          );
          headlight2.position = new BABYLON.Vector3(2.1, 0.8, -0.5);
          headlight2.parent = carBody;
          headlight2.material = lightMat;

          // Windshield
          const windshield = BABYLON.MeshBuilder.CreatePlane(
            "windshield",
            { width: 3, height: 1 },
            scene
          );
          windshield.position = new BABYLON.Vector3(1.8, 1.3, 0);
          windshield.rotation.y = Math.PI;
          windshield.rotation.x = -0.2;
          windshield.parent = carBody;
          const glassMat = new BABYLON.PBRMaterial("glassMat", scene);
          glassMat.albedoColor = new BABYLON.Color3(0.8, 0.9, 1);
          glassMat.alpha = 0.3;
          glassMat.roughness = 0.1;
          glassMat.metallic = 0.1;
          windshield.material = glassMat;

          safariCar = carBody as BABYLON.AbstractMesh;
        }
      }

      safariCar.position = new BABYLON.Vector3(0, 0.5, 0);
      safariCar.checkCollisions = true;
      // Set a reasonable collision shape for the vehicle root
      (safariCar as BABYLON.AbstractMesh).ellipsoid = new BABYLON.Vector3(
        1.2,
        1.0,
        2.2
      );
      (safariCar as BABYLON.AbstractMesh).ellipsoidOffset = new BABYLON.Vector3(
        0,
        1.0,
        0
      );
      cameraTarget.parent = safariCar;
      cameraTarget.position = new BABYLON.Vector3(0, 3, -8);

      // Simplified shadow system - only add car for now
      setTimeout(() => {
        try {
          if (safariCar && typeof safariCar.getBoundingInfo === "function") {
            shadowGenerator.addShadowCaster(safariCar);
          }
        } catch (e) {
          console.log("Shadows disabled due to compatibility issue");
        }
      }, 1000);

      // Dense Jungle Environment
      const createJungleTree = (
        x: number,
        z: number,
        type: string = "normal"
      ) => {
        const height =
          type === "tall" ? 15 + Math.random() * 10 : 8 + Math.random() * 5;
        const trunkRadius = type === "tall" ? 1.5 : 0.8;

        const trunk = BABYLON.MeshBuilder.CreateCylinder(
          "trunk",
          {
            height: height,
            diameterTop: trunkRadius * 0.7,
            diameterBottom: trunkRadius,
          },
          scene
        );
        trunk.position = new BABYLON.Vector3(x, height / 2, z);
        const trunkMat = new BABYLON.PBRMaterial("trunkMat", scene);
        trunkMat.albedoColor = new BABYLON.Color3(0.3, 0.15, 0.05);
        trunkMat.roughness = 0.95;
        trunk.material = trunkMat;
        trunk.checkCollisions = true;
        trunk.receiveShadows = true;

        // Dense jungle canopy
        const canopyLayers = type === "tall" ? 3 : 2;
        for (let layer = 0; layer < canopyLayers; layer++) {
          const canopy = BABYLON.MeshBuilder.CreateSphere(
            `canopy_${layer}`,
            { diameter: 8 - layer * 2 + Math.random() * 3 },
            scene
          );
          canopy.position = new BABYLON.Vector3(
            x + (Math.random() - 0.5) * 2,
            height - 2 + layer * 3,
            z + (Math.random() - 0.5) * 2
          );
          const canopyMat = new BABYLON.PBRMaterial(
            `canopyMat_${layer}`,
            scene
          );
          canopyMat.albedoColor = new BABYLON.Color3(
            0.05 + Math.random() * 0.1,
            0.3 + Math.random() * 0.2,
            0.05 + Math.random() * 0.1
          );
          canopyMat.roughness = 0.9;
          canopy.material = canopyMat;
          canopy.receiveShadows = true;
        }

        // Jungle undergrowth
        if (Math.random() > 0.5) {
          const bush = BABYLON.MeshBuilder.CreateSphere(
            "bush",
            { diameter: 2 + Math.random() },
            scene
          );
          bush.position = new BABYLON.Vector3(
            x + (Math.random() - 0.5) * 4,
            1,
            z + (Math.random() - 0.5) * 4
          );
          const bushMat = new BABYLON.PBRMaterial("bushMat", scene);
          bushMat.albedoColor = new BABYLON.Color3(0.1, 0.3, 0.1);
          bushMat.roughness = 0.8;
          bush.material = bushMat;
          bush.receiveShadows = true;
        }
      };

      // Create realistic safari road network
      const createSafariRoads = () => {
        // Main dirt road - long winding path
        const roadPoints = [];
        for (let i = 0; i < 50; i++) {
          const t = i / 49;
          const x = Math.sin(t * Math.PI * 4) * 30 + (Math.random() - 0.5) * 5;
          const z = t * 400 - 200;
          roadPoints.push(new BABYLON.Vector3(x, 0.1, z));
        }

        // Create road segments
        for (let i = 0; i < roadPoints.length - 1; i++) {
          const start = roadPoints[i];
          const end = roadPoints[i + 1];
          const midPoint = BABYLON.Vector3.Lerp(start, end, 0.5);

          const roadSegment = BABYLON.MeshBuilder.CreateGround(
            `road_${i}`,
            { width: 12, height: BABYLON.Vector3.Distance(start, end) + 2 },
            scene
          );
          roadSegment.position = midPoint;

          // Rotate to align with road direction
          const direction = end.subtract(start).normalize();
          roadSegment.rotation.y = Math.atan2(direction.x, direction.z);

          const roadMat = new BABYLON.PBRMaterial(`roadMat_${i}`, scene);
          roadMat.albedoColor = new BABYLON.Color3(0.45, 0.35, 0.25); // Dirt road color
          roadMat.roughness = 0.95;
          roadMat.metallic = 0.0;
          roadSegment.material = roadMat;
          roadSegment.receiveShadows = true;
        }

        // Add road markings and tire tracks
        for (let i = 0; i < roadPoints.length - 1; i += 3) {
          const point = roadPoints[i];

          // Tire tracks
          const leftTrack = BABYLON.MeshBuilder.CreateGround(
            `leftTrack_${i}`,
            { width: 0.8, height: 8 },
            scene
          );
          leftTrack.position = new BABYLON.Vector3(point.x - 2, 0.12, point.z);
          const rightTrack = BABYLON.MeshBuilder.CreateGround(
            `rightTrack_${i}`,
            { width: 0.8, height: 8 },
            scene
          );
          rightTrack.position = new BABYLON.Vector3(point.x + 2, 0.12, point.z);

          const trackMat = new BABYLON.PBRMaterial(`trackMat_${i}`, scene);
          trackMat.albedoColor = new BABYLON.Color3(0.3, 0.25, 0.2);
          trackMat.roughness = 1.0;
          leftTrack.material = trackMat;
          rightTrack.material = trackMat;
        }
      };

      createSafariRoads();

      // Generate realistic African savanna vegetation
      for (let i = 0; i < 120; i++) {
        const x = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;

        // Avoid placing trees too close to roads
        let tooCloseToRoad = false;
        const roadPoints = [];
        for (let j = 0; j < 50; j++) {
          const t = j / 49;
          const roadX =
            Math.sin(t * Math.PI * 4) * 30 + (Math.random() - 0.5) * 5;
          const roadZ = t * 400 - 200;
          const distance = Math.sqrt(
            (x - roadX) * (x - roadX) + (z - roadZ) * (z - roadZ)
          );
          if (distance < 15) {
            tooCloseToRoad = true;
            break;
          }
        }

        if (!tooCloseToRoad) {
          const treeType = Math.random() > 0.6 ? "tall" : "normal";
          createJungleTree(x, z, treeType);
        }
      }

      // Add African grass patches and shrubs
      for (let i = 0; i < 200; i++) {
        const grassPatch = BABYLON.MeshBuilder.CreateGround(
          "grass" + i,
          { width: 2 + Math.random() * 3, height: 2 + Math.random() * 3 },
          scene
        );
        grassPatch.position = new BABYLON.Vector3(
          (Math.random() - 0.5) * 350,
          0.02,
          (Math.random() - 0.5) * 350
        );
        const grassMat = new BABYLON.PBRMaterial("grassMat" + i, scene);
        grassMat.albedoColor = new BABYLON.Color3(
          0.3 + Math.random() * 0.2,
          0.5 + Math.random() * 0.3,
          0.2 + Math.random() * 0.1
        );
        grassMat.roughness = 0.9;
        grassPatch.material = grassMat;
        grassPatch.receiveShadows = true;
      }

      // Add African shrubs and bushes
      for (let i = 0; i < 100; i++) {
        const shrub = BABYLON.MeshBuilder.CreateSphere(
          "shrub" + i,
          { diameter: 1 + Math.random() * 2 },
          scene
        );
        shrub.position = new BABYLON.Vector3(
          (Math.random() - 0.5) * 300,
          0.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 300
        );
        shrub.scaling = new BABYLON.Vector3(1, 0.6 + Math.random() * 0.4, 1);
        const shrubMat = new BABYLON.PBRMaterial("shrubMat" + i, scene);
        shrubMat.albedoColor = new BABYLON.Color3(
          0.2 + Math.random() * 0.2,
          0.4 + Math.random() * 0.2,
          0.1 + Math.random() * 0.1
        );
        shrubMat.roughness = 0.8;
        shrub.material = shrubMat;
        shrub.receiveShadows = true;
        shrub.checkCollisions = true;
      }

      // Add jungle wildlife areas with animals
      const animals: BABYLON.AbstractMesh[] = [];
      for (let i = 0; i < 15; i++) {
        const clearingX = (Math.random() - 0.5) * 200;
        const clearingZ = (Math.random() - 0.5) * 200;
        const clearing = BABYLON.MeshBuilder.CreateGround(
          "clearing",
          { width: 12, height: 12 },
          scene
        );
        clearing.position = new BABYLON.Vector3(clearingX, 0.02, clearingZ);
        const clearingMat = new BABYLON.PBRMaterial("clearingMat", scene);
        clearingMat.albedoColor = new BABYLON.Color3(0.4, 0.6, 0.3);
        clearingMat.roughness = 0.8;
        clearing.material = clearingMat;
        clearing.receiveShadows = true;

        // Add animals to some clearings
        if (Math.random() > 0.6) {
          const animalType = Math.random();
          let animal: BABYLON.AbstractMesh;

          if (animalType < 0.3) {
            // Create Lion
            animal = createLion(
              clearingX + (Math.random() - 0.5) * 8,
              clearingZ + (Math.random() - 0.5) * 8
            );
          } else if (animalType < 0.6) {
            // Create Elephant
            animal = createElephant(
              clearingX + (Math.random() - 0.5) * 8,
              clearingZ + (Math.random() - 0.5) * 8
            );
          } else {
            // Create Zebra
            animal = createZebra(
              clearingX + (Math.random() - 0.5) * 8,
              clearingZ + (Math.random() - 0.5) * 8
            );
          }
          animals.push(animal);
        }
      }

      // Create realistic African animals
      function createLion(x: number, z: number): BABYLON.AbstractMesh {
        const lionGroup = new BABYLON.TransformNode("lionGroup", scene);
        lionGroup.position = new BABYLON.Vector3(x, 0, z);

        // Lion body
        const body = BABYLON.MeshBuilder.CreateCapsule(
          "lionBody",
          { height: 1.5, radius: 0.4 },
          scene
        );
        body.position = new BABYLON.Vector3(0, 0.8, 0);
        body.parent = lionGroup;
        const lionMat = new BABYLON.PBRMaterial("lionMat", scene);
        lionMat.albedoColor = new BABYLON.Color3(0.8, 0.6, 0.3);
        lionMat.roughness = 0.8;
        body.material = lionMat;

        // Lion head
        const head = BABYLON.MeshBuilder.CreateSphere(
          "lionHead",
          { diameter: 0.6 },
          scene
        );
        head.position = new BABYLON.Vector3(0.6, 1, 0);
        head.parent = lionGroup;
        head.material = lionMat;

        // Lion mane
        const mane = BABYLON.MeshBuilder.CreateSphere(
          "lionMane",
          { diameter: 0.9 },
          scene
        );
        mane.position = new BABYLON.Vector3(0.5, 1, 0);
        mane.parent = lionGroup;
        const maneMat = new BABYLON.PBRMaterial("maneMat", scene);
        maneMat.albedoColor = new BABYLON.Color3(0.6, 0.4, 0.2);
        maneMat.roughness = 1.0;
        mane.material = maneMat;

        // Lion legs
        for (let i = 0; i < 4; i++) {
          const leg = BABYLON.MeshBuilder.CreateCylinder(
            "lionLeg",
            { height: 0.8, diameter: 0.15 },
            scene
          );
          leg.position = new BABYLON.Vector3(
            i < 2 ? 0.3 : -0.3,
            0.4,
            i % 2 === 0 ? 0.3 : -0.3
          );
          leg.parent = lionGroup;
          leg.material = lionMat;
        }

        return lionGroup as BABYLON.AbstractMesh;
      }

      function createElephant(x: number, z: number): BABYLON.AbstractMesh {
        const elephantGroup = new BABYLON.TransformNode("elephantGroup", scene);
        elephantGroup.position = new BABYLON.Vector3(x, 0, z);

        // Elephant body
        const body = BABYLON.MeshBuilder.CreateSphere(
          "elephantBody",
          { diameter: 2.5 },
          scene
        );
        body.position = new BABYLON.Vector3(0, 1.5, 0);
        body.parent = elephantGroup;
        const elephantMat = new BABYLON.PBRMaterial("elephantMat", scene);
        elephantMat.albedoColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        elephantMat.roughness = 0.9;
        body.material = elephantMat;

        // Elephant head
        const head = BABYLON.MeshBuilder.CreateSphere(
          "elephantHead",
          { diameter: 1.5 },
          scene
        );
        head.position = new BABYLON.Vector3(1.5, 1.8, 0);
        head.parent = elephantGroup;
        head.material = elephantMat;

        // Elephant trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder(
          "elephantTrunk",
          { height: 1.5, diameterTop: 0.3, diameterBottom: 0.2 },
          scene
        );
        trunk.position = new BABYLON.Vector3(2.2, 1.2, 0);
        trunk.rotation.z = Math.PI / 4;
        trunk.parent = elephantGroup;
        trunk.material = elephantMat;

        // Elephant ears
        const leftEar = BABYLON.MeshBuilder.CreateSphere(
          "leftEar",
          { diameter: 1.2 },
          scene
        );
        leftEar.position = new BABYLON.Vector3(1.3, 2, 0.8);
        leftEar.scaling = new BABYLON.Vector3(0.1, 1, 1);
        leftEar.parent = elephantGroup;
        leftEar.material = elephantMat;

        const rightEar = BABYLON.MeshBuilder.CreateSphere(
          "rightEar",
          { diameter: 1.2 },
          scene
        );
        rightEar.position = new BABYLON.Vector3(1.3, 2, -0.8);
        rightEar.scaling = new BABYLON.Vector3(0.1, 1, 1);
        rightEar.parent = elephantGroup;
        rightEar.material = elephantMat;

        // Elephant legs
        for (let i = 0; i < 4; i++) {
          const leg = BABYLON.MeshBuilder.CreateCylinder(
            "elephantLeg",
            { height: 1.5, diameter: 0.4 },
            scene
          );
          leg.position = new BABYLON.Vector3(
            i < 2 ? 0.6 : -0.6,
            0.75,
            i % 2 === 0 ? 0.6 : -0.6
          );
          leg.parent = elephantGroup;
          leg.material = elephantMat;
        }

        return elephantGroup as BABYLON.AbstractMesh;
      }

      function createZebra(x: number, z: number): BABYLON.AbstractMesh {
        const zebraGroup = new BABYLON.TransformNode("zebraGroup", scene);
        zebraGroup.position = new BABYLON.Vector3(x, 0, z);

        // Zebra body
        const body = BABYLON.MeshBuilder.CreateCapsule(
          "zebraBody",
          { height: 1.2, radius: 0.3 },
          scene
        );
        body.position = new BABYLON.Vector3(0, 0.8, 0);
        body.parent = zebraGroup;
        const zebraMat = new BABYLON.PBRMaterial("zebraMat", scene);
        zebraMat.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        zebraMat.roughness = 0.7;
        body.material = zebraMat;

        // Zebra head
        const head = BABYLON.MeshBuilder.CreateSphere(
          "zebraHead",
          { diameter: 0.4 },
          scene
        );
        head.position = new BABYLON.Vector3(0.5, 1.2, 0);
        head.parent = zebraGroup;
        head.material = zebraMat;

        // Zebra neck
        const neck = BABYLON.MeshBuilder.CreateCylinder(
          "zebraNeck",
          { height: 0.6, diameter: 0.25 },
          scene
        );
        neck.position = new BABYLON.Vector3(0.3, 1.4, 0);
        neck.rotation.z = Math.PI / 6;
        neck.parent = zebraGroup;
        neck.material = zebraMat;

        // Zebra legs
        for (let i = 0; i < 4; i++) {
          const leg = BABYLON.MeshBuilder.CreateCylinder(
            "zebraLeg",
            { height: 0.8, diameter: 0.1 },
            scene
          );
          leg.position = new BABYLON.Vector3(
            i < 2 ? 0.2 : -0.2,
            0.4,
            i % 2 === 0 ? 0.2 : -0.2
          );
          leg.parent = zebraGroup;
          leg.material = zebraMat;
        }

        return zebraGroup as BABYLON.AbstractMesh;
      }

      // Create realistic African safari environment objects

      // Large African rock formations (kopjes)
      for (let i = 0; i < 15; i++) {
        const kopje = BABYLON.MeshBuilder.CreateSphere(
          "kopje" + i,
          { diameter: 8 + Math.random() * 12 },
          scene
        );
        kopje.position = new BABYLON.Vector3(
          (Math.random() - 0.5) * 300,
          2 + Math.random() * 4,
          (Math.random() - 0.5) * 300
        );
        kopje.scaling = new BABYLON.Vector3(1, 0.4 + Math.random() * 0.6, 1);
        const kopjeMat = new BABYLON.PBRMaterial("kopjeMat" + i, scene);
        kopjeMat.albedoColor = new BABYLON.Color3(0.6, 0.5, 0.4);
        kopjeMat.roughness = 0.9;
        kopjeMat.metallic = 0.1;
        kopje.material = kopjeMat;
        kopje.receiveShadows = true;
        kopje.checkCollisions = true;
      }

      // Smaller rocks scattered around
      for (let i = 0; i < 80; i++) {
        const rock = BABYLON.MeshBuilder.CreateSphere(
          "rock" + i,
          { diameter: 0.5 + Math.random() * 2 },
          scene
        );
        rock.position = new BABYLON.Vector3(
          (Math.random() - 0.5) * 250,
          0.3,
          (Math.random() - 0.5) * 250
        );
        rock.scaling = new BABYLON.Vector3(1, 0.6 + Math.random() * 0.8, 1);
        const rockMat = new BABYLON.PBRMaterial("rockMat" + i, scene);
        rockMat.albedoColor = new BABYLON.Color3(0.45, 0.4, 0.35);
        rockMat.roughness = 0.95;
        rockMat.metallic = 0.05;
        rock.material = rockMat;
        rock.receiveShadows = true;
        rock.checkCollisions = true;
      }

      // African safari props
      const createSafariProps = () => {
        // Safari observation towers
        for (let i = 0; i < 3; i++) {
          const towerPos = new BABYLON.Vector3(
            (Math.random() - 0.5) * 200,
            0,
            (Math.random() - 0.5) * 200
          );

          // Tower base
          const base = BABYLON.MeshBuilder.CreateCylinder(
            "towerBase" + i,
            { height: 8, diameter: 3 },
            scene
          );
          base.position = new BABYLON.Vector3(towerPos.x, 4, towerPos.z);
          const baseMat = new BABYLON.PBRMaterial("baseMat" + i, scene);
          baseMat.albedoColor = new BABYLON.Color3(0.4, 0.3, 0.2);
          baseMat.roughness = 0.8;
          base.material = baseMat;
          base.checkCollisions = true;

          // Tower platform
          const platform = BABYLON.MeshBuilder.CreateCylinder(
            "platform" + i,
            { height: 0.3, diameter: 5 },
            scene
          );
          platform.position = new BABYLON.Vector3(towerPos.x, 8.5, towerPos.z);
          platform.material = baseMat;

          // Railing
          for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2;
            const railing = BABYLON.MeshBuilder.CreateCylinder(
              "railing" + i + "_" + j,
              { height: 1.5, diameter: 0.1 },
              scene
            );
            railing.position = new BABYLON.Vector3(
              towerPos.x + Math.cos(angle) * 2.3,
              9.5,
              towerPos.z + Math.sin(angle) * 2.3
            );
            railing.material = baseMat;
          }
        }

        // Safari camp tents
        for (let i = 0; i < 5; i++) {
          const tentPos = new BABYLON.Vector3(
            (Math.random() - 0.5) * 150,
            0,
            (Math.random() - 0.5) * 150
          );

          // Tent body
          const tent = BABYLON.MeshBuilder.CreateSphere(
            "tent" + i,
            { diameter: 4 },
            scene
          );
          tent.position = new BABYLON.Vector3(tentPos.x, 1.5, tentPos.z);
          tent.scaling = new BABYLON.Vector3(1, 0.6, 1.2);
          const tentMat = new BABYLON.PBRMaterial("tentMat" + i, scene);
          tentMat.albedoColor = new BABYLON.Color3(0.8, 0.7, 0.5);
          tentMat.roughness = 0.9;
          tent.material = tentMat;
          tent.checkCollisions = true;

          // Tent poles
          for (let j = 0; j < 4; j++) {
            const angle = (j / 4) * Math.PI * 2;
            const pole = BABYLON.MeshBuilder.CreateCylinder(
              "pole" + i + "_" + j,
              { height: 3, diameter: 0.1 },
              scene
            );
            pole.position = new BABYLON.Vector3(
              tentPos.x + Math.cos(angle) * 1.8,
              1.5,
              tentPos.z + Math.sin(angle) * 2
            );
            const poleMat = new BABYLON.PBRMaterial("poleMat", scene);
            poleMat.albedoColor = new BABYLON.Color3(0.4, 0.3, 0.2);
            poleMat.roughness = 0.8;
            pole.material = poleMat;
          }
        }

        // Safari vehicles (abandoned/parked)
        for (let i = 0; i < 2; i++) {
          const vehiclePos = new BABYLON.Vector3(
            (Math.random() - 0.5) * 100,
            0,
            (Math.random() - 0.5) * 100
          );

          // Vehicle body
          const vehicle = BABYLON.MeshBuilder.CreateBox(
            "vehicle" + i,
            { width: 3, height: 1.5, depth: 1.8 },
            scene
          );
          vehicle.position = new BABYLON.Vector3(vehiclePos.x, 1, vehiclePos.z);
          const vehicleMat = new BABYLON.PBRMaterial("vehicleMat" + i, scene);
          vehicleMat.albedoColor = new BABYLON.Color3(0.3, 0.4, 0.2);
          vehicleMat.roughness = 0.7;
          vehicleMat.metallic = 0.3;
          vehicle.material = vehicleMat;
          vehicle.checkCollisions = true;

          // Vehicle wheels
          for (let j = 0; j < 4; j++) {
            const wheel = BABYLON.MeshBuilder.CreateCylinder(
              "wheel" + i + "_" + j,
              { height: 0.3, diameter: 1 },
              scene
            );
            wheel.position = new BABYLON.Vector3(
              vehiclePos.x + (j < 2 ? -1.2 : 1.2),
              0.5,
              vehiclePos.z + (j % 2 === 0 ? -0.8 : 0.8)
            );
            wheel.rotation.z = Math.PI / 2;
            const wheelMat = new BABYLON.PBRMaterial("wheelMat", scene);
            wheelMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            wheelMat.roughness = 0.9;
            wheel.material = wheelMat;
          }
        }

        // African termite mounds
        for (let i = 0; i < 12; i++) {
          const mound = BABYLON.MeshBuilder.CreateCylinder(
            "mound" + i,
            {
              height: 2 + Math.random() * 3,
              diameterTop: 0.5,
              diameterBottom: 1.5 + Math.random(),
            },
            scene
          );
          mound.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 200,
            (2 + Math.random() * 3) / 2,
            (Math.random() - 0.5) * 200
          );
          const moundMat = new BABYLON.PBRMaterial("moundMat" + i, scene);
          moundMat.albedoColor = new BABYLON.Color3(0.6, 0.4, 0.3);
          moundMat.roughness = 0.95;
          mound.material = moundMat;
          mound.receiveShadows = true;
          mound.checkCollisions = true;
        }

        // Dead tree logs
        for (let i = 0; i < 15; i++) {
          const log = BABYLON.MeshBuilder.CreateCylinder(
            "log" + i,
            {
              height: 0.8,
              diameter: 0.6 + Math.random() * 0.4,
            },
            scene
          );
          log.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 180,
            0.4,
            (Math.random() - 0.5) * 180
          );
          log.rotation.z = Math.PI / 2;
          log.rotation.y = Math.random() * Math.PI * 2;
          const logMat = new BABYLON.PBRMaterial("logMat" + i, scene);
          logMat.albedoColor = new BABYLON.Color3(0.3, 0.2, 0.15);
          logMat.roughness = 0.9;
          log.material = logMat;
          log.receiveShadows = true;
          log.checkCollisions = true;
        }
      };

      createSafariProps();

      // Water feature
      const water = BABYLON.MeshBuilder.CreateGround(
        "water",
        { width: 20, height: 20 },
        scene
      );
      water.position = new BABYLON.Vector3(30, 0.1, -20);
      const waterMat = new BABYLON.PBRMaterial("waterMat", scene);
      waterMat.albedoColor = new BABYLON.Color3(0.1, 0.3, 0.6);
      waterMat.roughness = 0.1;
      waterMat.metallic = 0.8;
      waterMat.alpha = 0.8;
      water.material = waterMat;

      // Golden Safari Treasures
      const collectibles: BABYLON.AbstractMesh[] = [];
      for (let i = 0; i < 20; i++) {
        const treasureType = Math.random();
        let treasure: BABYLON.AbstractMesh;

        if (treasureType < 0.4) {
          // Golden orbs
          treasure = BABYLON.MeshBuilder.CreateSphere(
            "goldOrb" + i,
            { diameter: 0.4 },
            scene
          );
          const goldMat = new BABYLON.PBRMaterial("goldMat", scene);
          goldMat.albedoColor = new BABYLON.Color3(1.0, 0.8, 0.2);
          goldMat.emissiveColor = new BABYLON.Color3(0.8, 0.6, 0.1);
          goldMat.roughness = 0.1;
          goldMat.metallic = 0.9;
          treasure.material = goldMat;
        } else if (treasureType < 0.7) {
          // Crystal formations
          treasure = BABYLON.MeshBuilder.CreateCylinder(
            "crystal" + i,
            { height: 0.6, diameterTop: 0.1, diameterBottom: 0.3 },
            scene
          );
          const crystalMat = new BABYLON.PBRMaterial("crystalMat", scene);
          crystalMat.albedoColor = new BABYLON.Color3(0.9, 0.7, 0.3);
          crystalMat.emissiveColor = new BABYLON.Color3(0.6, 0.4, 0.1);
          crystalMat.roughness = 0.0;
          crystalMat.metallic = 0.1;
          crystalMat.alpha = 0.8;
          treasure.material = crystalMat;
        } else {
          // Ancient artifacts
          treasure = BABYLON.MeshBuilder.CreateBox(
            "artifact" + i,
            { width: 0.3, height: 0.3, depth: 0.3 },
            scene
          );
          const artifactMat = new BABYLON.PBRMaterial("artifactMat", scene);
          artifactMat.albedoColor = new BABYLON.Color3(0.7, 0.5, 0.2);
          artifactMat.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0.1);
          artifactMat.roughness = 0.4;
          artifactMat.metallic = 0.7;
          treasure.material = artifactMat;
        }

        treasure.position = new BABYLON.Vector3(
          (Math.random() - 0.5) * 120,
          1.5 + Math.sin(Date.now() * 0.001 + i) * 0.2,
          (Math.random() - 0.5) * 120
        );

        // Add glowing aura
        const aura = BABYLON.MeshBuilder.CreateSphere(
          "aura" + i,
          { diameter: 0.8 },
          scene
        );
        aura.position = treasure.position.clone();
        aura.parent = treasure;
        const auraMat = new BABYLON.StandardMaterial("auraMat", scene);
        auraMat.emissiveColor = new BABYLON.Color3(1.0, 0.7, 0.2);
        auraMat.alpha = 0.1;
        aura.material = auraMat;

        collectibles.push(treasure);
      }

      // Input handling
      const input = { f: 0, r: 0, space: false };
      const keysDown = new Set<string>();
      const onKeyDown = (e: KeyboardEvent) => keysDown.add(e.key.toLowerCase());
      const onKeyUp = (e: KeyboardEvent) =>
        keysDown.delete(e.key.toLowerCase());
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      // Realistic Car Physics System
      const modelYawOffset = Math.PI / 2; // align Humvee forward (+Z)
      let carVelocity = 0;
      let carRotation = modelYawOffset;
      let wheelRotation = 0;
      const maxSpeed = 0.5;
      const acceleration = 0.02;
      const braking = 0.05;
      const friction = 0.95;
      const turnSpeed = 0.02;

      scene.onBeforeRenderObservable.add(() => {
        // Update inputs
        input.f =
          (keysDown.has("w") || keysDown.has("arrowup") ? 1 : 0) +
          (keysDown.has("s") || keysDown.has("arrowdown") ? -1 : 0);
        input.r =
          (keysDown.has("d") || keysDown.has("arrowright") ? 1 : 0) +
          (keysDown.has("a") || keysDown.has("arrowleft") ? -1 : 0);
        input.space = keysDown.has(" ");

        // Car acceleration/braking
        if (input.f > 0) {
          carVelocity = Math.min(carVelocity + acceleration, maxSpeed);
        } else if (input.f < 0) {
          carVelocity = Math.max(carVelocity - braking, -maxSpeed * 0.5);
        } else if (input.space) {
          // Handbrake
          carVelocity *= 0.9;
        } else {
          // Natural friction
          carVelocity *= friction;
        }

        // Car steering (allow slight in-place turning)
        const speedAbs = Math.abs(carVelocity);
        const steerFactor = Math.max(0.25, Math.min(speedAbs / maxSpeed, 1));
        carRotation +=
          input.r * turnSpeed * steerFactor * (carVelocity >= 0 ? 1 : -1);
        safariCar.rotation.y = carRotation;

        // Calculate movement direction
        const forward = new BABYLON.Vector3(
          Math.sin(carRotation),
          0,
          Math.cos(carRotation)
        );
        const movement = forward.scale(carVelocity);

        // Apply movement with collisions
        const move = movement.add(scene.gravity);
        safariCar.moveWithCollisions(move);

        // Animate wheels
        wheelRotation += carVelocity * 2;
        const wheels = safariCar
          .getChildMeshes()
          .filter((mesh) => mesh.name.includes("wheel"));
        wheels.forEach((wheel) => {
          if (wheel.name.includes("1") || wheel.name.includes("2")) {
            wheel.rotation.x = wheelRotation;
          } else {
            wheel.rotation.x = wheelRotation;
          }
        });

        // Camera follows car smoothly
        const targetPos = safariCar.position.add(new BABYLON.Vector3(0, 2, 0));
        camera.setTarget(
          BABYLON.Vector3.Lerp(camera.getTarget(), targetPos, 0.05)
        );

        // Dynamic camera positioning based on speed
        const cameraDistance = 8 + Math.abs(carVelocity) * 10;
        const cameraHeight = 3 + Math.abs(carVelocity) * 5;
        const cameraOffset = new BABYLON.Vector3(
          -Math.sin(carRotation) * cameraDistance,
          cameraHeight,
          -Math.cos(carRotation) * cameraDistance
        );
        const idealCameraPos = safariCar.position.add(cameraOffset);
        camera.position = BABYLON.Vector3.Lerp(
          camera.position,
          idealCameraPos,
          0.02
        );

        // Animate animals realistically
        animals.forEach((animal, index) => {
          if (animal && !animal.isDisposed()) {
            const time = Date.now() * 0.001;

            // Random movement pattern
            if (Math.random() < 0.005) {
              const moveDistance = 0.1;
              animal.position.x += (Math.random() - 0.5) * moveDistance;
              animal.position.z += (Math.random() - 0.5) * moveDistance;

              // Face movement direction
              const angle = Math.atan2(
                (Math.random() - 0.5) * moveDistance,
                (Math.random() - 0.5) * moveDistance
              );
              animal.rotation.y = angle;
            }

            // Breathing animation
            animal.scaling.y = 1 + Math.sin(time * 3 + index) * 0.02;

            // Different behaviors per animal type
            if (animal.name.includes("lion")) {
              // Lions occasionally roar (scale up briefly)
              if (Math.random() < 0.001) {
                animal.scaling.setAll(1.1);
                setTimeout(() => animal.scaling.setAll(1), 500);
              }
            } else if (animal.name.includes("elephant")) {
              // Elephants sway their trunks
              const trunk = animal
                .getChildMeshes()
                .find((m) => m.name.includes("trunk"));
              if (trunk) {
                trunk.rotation.x = Math.sin(time + index) * 0.3;
              }
            } else if (animal.name.includes("zebra")) {
              // Zebras occasionally look around
              if (Math.random() < 0.002) {
                animal.rotation.y += (Math.random() - 0.5) * 0.5;
              }
            }
          }
        });

        // Collectible interaction
        collectibles.forEach((collectible, index) => {
          if (collectible.isDisposed()) return;

          const distance = BABYLON.Vector3.Distance(
            safariCar.position,
            collectible.position
          );
          if (distance < 4) {
            // Larger pickup radius for car
            collectible.dispose();
            collectibles.splice(index, 1);
            setScore((prev) => prev + 10);
          }

          // Floating animation with golden glow
          collectible.position.y =
            1.5 + Math.sin(Date.now() * 0.003 + index) * 0.3;
          collectible.rotation.y += 0.02;
        });

        setFps(Math.round(engine.getFps()));
      });

      setLoading(false);
      return scene;
    };

    createScene().then((scene) => {
      engine.runRenderLoop(() => scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
      engine.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center text-amber-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Loading Safari World...</h2>
            <p className="text-sm opacity-80">
              Preparing realistic 3D environment
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-md border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-amber-100">
          <button
            onClick={() => router.push("/")}
            className="hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">Health: {health}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Score: {score}</span>
            </div>
            <div className="text-sm">FPS: {fps}</div>
          </div>

          <a
            href="https://doc.babylonjs.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Powered by Babylon.js
          </a>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Game HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md text-amber-100 p-4 rounded-lg border border-amber-500/30">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" /> Controls
        </h3>
        <div className="text-sm space-y-1">
          <p>
            <kbd className="bg-amber-700/50 px-2 py-1 rounded text-xs">
              W / ↑
            </kbd>{" "}
            Accelerate Forward
          </p>
          <p>
            <kbd className="bg-amber-700/50 px-2 py-1 rounded text-xs">
              S / ↓
            </kbd>{" "}
            Reverse/Brake
          </p>
          <p>
            <kbd className="bg-amber-700/50 px-2 py-1 rounded text-xs">
              A / D / ← / →
            </kbd>{" "}
            Steer Left/Right
          </p>
          <p>
            <kbd className="bg-amber-700/50 px-2 py-1 rounded text-xs">
              Space
            </kbd>{" "}
            Handbrake
          </p>
        </div>
      </div>

      {/* Objectives */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md text-amber-100 p-4 rounded-lg border border-amber-500/30 max-w-xs">
        <h3 className="font-semibold mb-2">🎯 Objectives</h3>
        <div className="text-sm space-y-1">
          <p>🛣️ Follow the winding dirt safari roads</p>
          <p>💎 Collect golden treasures (+10 points)</p>
          <p>🏕️ Discover safari camps and observation towers</p>
          <p>🦁 Encounter lions, elephants, and zebras</p>
          <p>🌅 Experience authentic African sunset</p>
          <p className="text-amber-300 font-medium">
            Goal: Complete the safari adventure!
          </p>
        </div>
      </div>

      {/* Quality Features Info */}
      <div className="absolute top-20 right-4 z-10 bg-black/60 backdrop-blur-md text-amber-100 p-3 rounded-lg border border-amber-500/30 max-w-sm">
        <h4 className="font-semibold mb-2 text-amber-300">
          🚀 Enhanced Features
        </h4>
        <div className="text-xs space-y-1">
          <p>✅ Winding Safari Road Network</p>
          <p>✅ Realistic African Wildlife</p>
          <p>✅ Safari Camps & Observation Towers</p>
          <p>✅ Golden Sunset Atmosphere</p>
          <p>✅ Authentic African Vegetation</p>
          <p>✅ Rock Formations & Termite Mounds</p>
        </div>
      </div>
    </div>
  );
}
