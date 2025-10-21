import type { CollabStatus } from './collabSession';

export interface CollabStatusInfo {
  color: string;
  bgColor: string;
  label: string;
}

export function getCollabStatusLabel(status: CollabStatus, peerCount: number): string {
  if (status === 'connecting') {
    return 'Connecting...';
  }
  
  if (status === 'connected') {
    if (peerCount > 0) {
      return `Connected (${peerCount} peer${peerCount === 1 ? '' : 's'})`;
    }
    return 'Connected Solo';
  }
  
  return 'Disconnected';
}

export function getCollabStatusInfo(status: CollabStatus, peerCount: number): CollabStatusInfo {
  const label = getCollabStatusLabel(status, peerCount);
  
  if (status === 'connecting') {
    return {
      color: 'text-yellow-400',
      bgColor: '#eab308', // yellow-500
      label,
    };
  }
  
  if (status === 'connected') {
    if (peerCount > 0) {
      return {
        color: 'text-green-400',
        bgColor: '#22c55e', // green-500
        label,
      };
    }
    return {
      color: 'text-orange-400',
      bgColor: '#f97316', // orange-500
      label,
    };
  }
  
  return {
    color: 'text-neutral-500',
    bgColor: '#404040', // neutral-700
    label,
  };
}
