import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../components/atoms/Button'
import type { ButtonVariant, ButtonSize } from '../../components/atoms/Button'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
}))

describe('Button Component', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Test Button')
    })

    it('should render button with custom className', () => {
      const props = { ...defaultProps, className: 'custom-class' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should render button with variant styling', () => {
      const props = { ...defaultProps, variant: 'primary' as ButtonVariant }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-white')
    })
  })

  describe('Click Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const props = { ...defaultProps, disabled: true }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      await user.click(button)
      expect(defaultProps.onClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard interactions', async () => {
      const user = userEvent.setup()
      
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      const props = { ...defaultProps, 'aria-label': 'Custom label' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button', { name: 'Custom label' })
      expect(button).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      const props = { ...defaultProps, 'aria-describedby': 'description-id' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description-id')
    })

    it('should be focusable when not disabled', () => {
      render(<Button {...defaultProps} />)
      
      const button = screen.getByRole('button')
      // Native buttons are focusable by default, no need for tabIndex
      expect(button).not.toHaveAttribute('disabled')
    })

    it('should not be focusable when disabled', () => {
      const props = { ...defaultProps, disabled: true }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Loading State', () => {
    it('should show loading state', () => {
      const props = { ...defaultProps, isLoading: true }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // Loading state shows a spinner and 'Loading...' in sr-only
      expect(screen.getByText('Loading...', { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup()
      const props = { ...defaultProps, isLoading: true }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(defaultProps.onClick).not.toHaveBeenCalled()
    })
  })

  describe('Type Variants', () => {
    it('should render primary button', () => {
      const props = { ...defaultProps, variant: 'primary' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-white')
    })

    it('should render secondary button', () => {
      const props = { ...defaultProps, variant: 'secondary' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-white')
    })

    it('should render outline button', () => {
      const props = { ...defaultProps, variant: 'outline' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2', 'border-primary', 'text-primary')
    })

    it('should render ghost button', () => {
      const props = { ...defaultProps, variant: 'ghost' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary')
    })
  })

  describe('Size Variants', () => {
    it('should render small button', () => {
      const props = { ...defaultProps, size: 'sm' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('should render medium button', () => {
      const props = { ...defaultProps, size: 'md' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-base')
    })

    it('should render large button', () => {
      const props = { ...defaultProps, size: 'lg' }
      
      render(<Button {...props} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
    })
  })

  describe('Form Integration', () => {
    it('should work as form submit button', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <form onSubmit={mockSubmit}>
          <Button {...defaultProps} type="submit" />
        </form>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('should respect form validation', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <form onSubmit={mockSubmit}>
          <input required data-testid="required-input" />
          <Button {...defaultProps} type="submit" />
        </form>
      )
      
      const button = screen.getByRole('button')
      const form = button.closest('form')
      
      // Form should not submit without required field
      await user.click(button)
      expect(mockSubmit).not.toHaveBeenCalled()
      
      // Fill required field and submit
      const input = screen.getByTestId('required-input')
      await user.type(input, 'test value')
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })
  })
})