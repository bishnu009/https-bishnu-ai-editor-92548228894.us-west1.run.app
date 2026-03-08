
import React from 'react';
import * as THREE from 'three';

export interface EditorState {
  originalImage: string | null; // Base64
  currentImage: string | null;  // Base64
  isProcessing: boolean;
  history: string[]; // Undo stack
  historyIndex: number;
}

export enum ToolType {
  CROP = 'Crop',
  ID_PHOTO = 'ID',
  BG_REMOVE = 'BG',
  AI = 'AI',
  COLOR_GRADE = 'Color',
  HAIRSTYLE = 'Hair',
  HAIR_COLOR = 'H-Color',
  AVATAR = 'Avatar',
  TEXT = 'Text',
  FRAME = 'Frame',
  OUTFIT = 'Outfit',
  AI_BLEND = 'Blend',
  AI_FILTER = 'Ai filter',
  STICKER = 'Sticker',
  AI_EXPAND = 'AI Expand',
  LOGO_CREATOR = 'Logo Creator',
}

export interface ToolItem {
  type: ToolType;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  color?: string;
  glowColor?: string;
}

export type LayerType = 'text' | 'sticker';

export interface Layer {
  id: string;
  type: LayerType;
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number;
  color?: string;
  rotation: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isItalic?: boolean;
}

export interface StoryboardScene {
  id: string;
  scriptText: string;
  visualPrompt: string;
  imageUrl?: string;
  isGenerating: boolean;
}

/** 
 * Represents the state of the Voxel simulation 
 */
export enum AppState {
  STABLE = 'STABLE',
  DISMANTLING = 'DISMANTLING',
  REBUILDING = 'REBUILDING'
}

/** 
 * Static data for a single voxel 
 */
export interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: number;
}

/** 
 * Extended data for a voxel during physics simulation 
 */
export interface SimulationVoxel {
  id: number;
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  rvx: number;
  rvy: number;
  rvz: number;
}

/** 
 * Targeting info for rebuilding a model 
 */
export interface RebuildTarget {
  x: number;
  y: number;
  z: number;
  delay: number;
  isRubble?: boolean;
}

/** 
 * A named model that can be saved/loaded 
 */
export interface SavedModel {
  name: string;
  data: VoxelData[];
}