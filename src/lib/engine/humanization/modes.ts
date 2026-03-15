/**
 * Humanization mode configuration helpers.
 *
 * Re-exports MODE_CONFIGS from constants and provides a typed accessor.
 */

import type { HumanizationMode, ModeConfig } from '@/types';
import { MODE_CONFIGS } from '@/constants';

export { MODE_CONFIGS };

/**
 * Get the configuration for a specific humanization mode.
 * Throws if the mode is not recognized.
 */
export function getModeConfig(mode: HumanizationMode): ModeConfig {
  const config = MODE_CONFIGS[mode];
  if (!config) {
    throw new Error(`Unknown humanization mode: "${mode}". Valid modes: ${Object.keys(MODE_CONFIGS).join(', ')}`);
  }
  return config;
}
