import React, { Suspense, lazy } from 'react'

// Lazy load the MathEditDialog component
const MathEditDialog = lazy(() => 
  import('./MathEditDialog').then(module => ({ default: module.MathEditDialog }))
)

// Simple loading fallback
const MathDialogSkeleton: React.FC = () => (
  <div className="math-dialog-overlay">
    <div className="math-dialog">
      <div className="math-dialog-header">
        <div className="math-dialog-title">
          <div style={{ width: 18, height: 18, backgroundColor: '#e5e7eb', borderRadius: 2 }}></div>
          <span>Loading...</span>
        </div>
      </div>
      <div className="math-dialog-content">
        <div style={{ 
          width: '100%', 
          height: 40, 
          backgroundColor: '#f3f4f6', 
          borderRadius: 4,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </div>
    </div>
  </div>
)

interface LazyMathEditDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (latex: string) => void
  initialLatex: string
  isBlockMath: boolean
}

export const LazyMathEditDialog: React.FC<LazyMathEditDialogProps> = (props) => {
  // Don't render anything if not open to avoid unnecessary loading
  if (!props.isOpen) {
    return null
  }

  return (
    <Suspense fallback={<MathDialogSkeleton />}>
      <MathEditDialog {...props} />
    </Suspense>
  )
}

export default LazyMathEditDialog