import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { BankerState, AlgorithmState } from '../../../types';

interface Banker3DSceneProps {
  state: BankerState;
  currentProcessIdx: number | null;
  completedProcesses: boolean[];
  eligibleProcesses?: boolean[];
  isSafeState?: boolean;
}

// 3D Process Node
const ProcessNode = ({
  name,
  position,
  status,
  alloc,
  need,
  isSelected,
}: {
  name: string;
  position: [number, number, number];
  status: AlgorithmState;
  alloc: number[];
  need: number[];
  isSelected: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    switch (status) {
      case 'completed':
        return '#15966A'; // emerald
      case 'executing':
        return '#7657F6'; // violet
      case 'eligible':
        return '#315EFB'; // bright blue
      case 'denied':
        return '#D94B5B'; // red
      case 'waiting':
        return '#94A3B8'; // gray
      default:
        return '#E2E8F0'; // neutral slate
    }
  }, [status]);

  useFrame((_, delta) => {
    if (meshRef.current && (status === 'executing' || isSelected)) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Outer Glow Ring for Active States */}
      {(status === 'executing' || status === 'eligible') && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.45, 32]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main Glass Node */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.9, 0.9, 0.7, 32]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.4}
          roughness={0.2}
          metalness={0.1}
          reflectivity={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Process Label */}
      <Text
        position={[0, 0.75, 0]}
        fontSize={0.42}
        color="#172033"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#ffffff"
      >
        {name}
      </Text>

      {/* Need / Alloc Subtext */}
      <Text
        position={[0, -0.65, 0]}
        fontSize={0.22}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        {`N:[${need.join(',')}] A:[${alloc.join(',')}]`}
      </Text>
    </group>
  );
};

// 3D Resource Cluster with countable blocks
const ResourceCluster = ({
  name,
  position,
  availableCount,
  color,
}: {
  name: string;
  position: [number, number, number];
  availableCount: number;
  color: string;
}) => {
  return (
    <group position={position}>
      {/* Base Pedestal */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.3, 24]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* Resource Cluster Label */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.38}
        color="#172033"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {`Resource ${name} (Free: ${availableCount})`}
      </Text>

      {/* Countable Unit Cubes */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 0.2, 0]}>
          {Array.from({ length: Math.min(8, Math.max(1, availableCount)) }).map((_, i) => {
            const angle = (i / Math.min(8, Math.max(1, availableCount))) * Math.PI * 2;
            const radius = availableCount > 1 ? 0.6 : 0;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            return (
              <mesh key={i} position={[x, 0.2 + (i % 2) * 0.15, z]}>
                <boxGeometry args={[0.32, 0.32, 0.32]} />
                <meshStandardMaterial
                  color={availableCount > 0 ? color : '#CBD5E1'}
                  roughness={0.2}
                  metalness={0.3}
                />
              </mesh>
            );
          })}
        </group>
      </Float>
    </group>
  );
};

// Flow Particles / Beams between active process and resource pools
const FlowBeam = ({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) => {
  const lineObject = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    return new THREE.Line(geom, mat);
  }, [from, to, color]);

  return <primitive object={lineObject} />;
};

export const Banker3DScene: React.FC<Banker3DSceneProps> = ({
  state,
  currentProcessIdx,
  completedProcesses,
  eligibleProcesses,
}) => {
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'process' | 'resource'>('overview');
  const controlsRef = useRef<any>(null);

  const processCount = state.processNames.length;
  const resourceCount = state.resourceNames.length;

  // Layout calculations
  const processRadius = 5.2;
  const processPositions: [number, number, number][] = useMemo(() => {
    return state.processNames.map((_, i) => {
      const angle = (i / processCount) * Math.PI * 2 - Math.PI / 2;
      return [Math.cos(angle) * processRadius, 0, Math.sin(angle) * processRadius];
    });
  }, [processCount, processRadius, state.processNames]);

  const resourcePositions: [number, number, number][] = useMemo(() => {
    const spacing = 2.6;
    const startX = -((resourceCount - 1) * spacing) / 2;
    return state.resourceNames.map((_, i) => [startX + i * spacing, 0, 0]);
  }, [resourceCount, state.resourceNames]);

  const resourceColors = ['#315EFB', '#7657F6', '#15966A', '#D99116'];

  // Camera presets
  const handlePreset = (preset: 'overview' | 'process' | 'resource') => {
    setCameraPreset(preset);
    if (!controlsRef.current) return;
    if (preset === 'overview') {
      controlsRef.current.object.position.set(0, 11, 14);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'process') {
      controlsRef.current.object.position.set(0, 4, 9);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'resource') {
      controlsRef.current.object.position.set(0, 12, 3);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-2xl border border-app-border overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 11, 14], fov: 42 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <pointLight position={[-10, 8, -10]} intensity={0.5} color="#EEF3FF" />

        {/* Circular Grid Platform */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <circleGeometry args={[7.2, 48]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
        <gridHelper args={[14, 14, '#CBD5E1', '#E2E8F0']} position={[0, -0.39, 0]} />

        {/* Resource Clusters in Center */}
        {state.resourceNames.map((rName, rIdx) => (
          <ResourceCluster
            key={rName}
            name={rName}
            position={resourcePositions[rIdx]}
            availableCount={state.available[rIdx]}
            color={resourceColors[rIdx % resourceColors.length]}
          />
        ))}

        {/* Process Nodes in Orbit */}
        {state.processNames.map((pName, pIdx) => {
          let status: AlgorithmState = 'idle';
          if (completedProcesses[pIdx]) {
            status = 'completed';
          } else if (currentProcessIdx === pIdx) {
            status = 'executing';
          } else if (eligibleProcesses && eligibleProcesses[pIdx]) {
            status = 'eligible';
          }

          const needRow = state.need
            ? state.need[pIdx]
            : state.max[pIdx].map((m, r) => m - state.allocation[pIdx][r]);

          return (
            <React.Fragment key={pName}>
              <ProcessNode
                name={pName}
                position={processPositions[pIdx]}
                status={status}
                alloc={state.allocation[pIdx]}
                need={needRow}
                isSelected={currentProcessIdx === pIdx}
              />

              {/* Dynamic Flow Beams for active process */}
              {currentProcessIdx === pIdx &&
                resourcePositions.map((rPos, rIdx) => (
                  <FlowBeam
                    key={`beam-${pIdx}-${rIdx}`}
                    from={processPositions[pIdx]}
                    to={rPos}
                    color="#315EFB"
                  />
                ))}
            </React.Fragment>
          );
        })}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={6}
          maxDistance={22}
        />
      </Canvas>

      {/* Camera Preset Controls */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-app-border shadow-xs flex items-center space-x-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 px-1 font-mono">Camera:</span>
        <button
          onClick={() => handlePreset('overview')}
          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
            cameraPreset === 'overview'
              ? 'bg-primary-blue text-white shadow-xs'
              : 'text-text-muted hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handlePreset('process')}
          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
            cameraPreset === 'process'
              ? 'bg-primary-blue text-white shadow-xs'
              : 'text-text-muted hover:bg-slate-100'
          }`}
        >
          Process View
        </button>
        <button
          onClick={() => handlePreset('resource')}
          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
            cameraPreset === 'resource'
              ? 'bg-primary-blue text-white shadow-xs'
              : 'text-text-muted hover:bg-slate-100'
          }`}
        >
          Resource View
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-app-border shadow-xs text-[11px] flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
          <span className="text-slate-600">Idle / Waiting</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
          <span className="text-slate-600">Eligible (Need ≤ Work)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-ping" />
          <span className="text-slate-600">Executing</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
          <span className="text-slate-600">Completed (Released)</span>
        </div>
      </div>
    </div>
  );
};
