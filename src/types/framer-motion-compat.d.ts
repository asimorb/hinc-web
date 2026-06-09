import 'framer-motion'

declare module 'framer-motion' {
  export type AnimationControls = import('motion-dom').LegacyAnimationControls
}
