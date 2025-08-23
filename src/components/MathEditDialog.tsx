import React, { useState, useEffect, useRef } from 'react'
import { X, Check, Calculator } from 'lucide-react'

interface MathEditDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (latex: string) => void
  initialLatex: string
  isBlockMath: boolean
}

export const MathEditDialog: React.FC<MathEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLatex,
  isBlockMath
}) => {
  const [latex, setLatex] = useState(initialLatex)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setLatex(initialLatex)
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, initialLatex])

  const handleSave = () => {
    onSave(latex.trim())
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && !isBlockMath) {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="math-dialog-overlay">
      <div className="math-dialog">
        <div className="math-dialog-header">
          <div className="math-dialog-title">
            <Calculator size={18} />
            <span>Edit {isBlockMath ? 'Block' : 'Inline'} Math</span>
          </div>
          <button 
            className="math-dialog-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="math-dialog-content">
          <label className="math-dialog-label">
            LaTeX Expression
          </label>
          
          {isBlockMath ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              onKeyDown={handleKeyDown}
              className="math-dialog-textarea"
              placeholder="Enter LaTeX expression..."
              rows={6}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              onKeyDown={handleKeyDown}
              className="math-dialog-input"
              placeholder="Enter LaTeX expression..."
            />
          )}
          
          <div className="math-dialog-hint">
            {isBlockMath 
              ? 'Use Ctrl/Cmd + Enter to save, Escape to cancel'
              : 'Press Enter to save, Escape to cancel'
            }
          </div>
        </div>
        
        <div className="math-dialog-actions">
          <button 
            className="math-dialog-button math-dialog-button--cancel"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="math-dialog-button math-dialog-button--save"
            onClick={handleSave}
            type="button"
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default MathEditDialog