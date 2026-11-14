import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import ErrorBoundary from '../components/common/ErrorBoundary';
import NotFound from '../components/common/NotFound';

describe('Frontend UI Atoms & Components', () => {
  describe('Badge', () => {
    it('renders text and applies default styling', () => {
      render(<Badge>Verified Driver</Badge>);
      const badgeText = screen.getByText('Verified Driver');
      expect(badgeText).toBeInTheDocument();
      const badgeContainer = badgeText.closest('span');
      expect(badgeContainer.parentElement.className).toContain('rounded-full');
    });

    it('renders with success variant', () => {
      render(<Badge variant="success">Available Now</Badge>);
      const badgeText = screen.getByText('Available Now');
      const badgeContainer = badgeText.closest('span');
      expect(badgeContainer.parentElement.className).toContain('text-emerald-700');
    });
  });

  describe('Button', () => {
    it('renders with text and handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Book Chauffeur</Button>);
      const btn = screen.getByRole('button', { name: /Book Chauffeur/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables click when disabled prop is passed', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Action</Button>);
      const btn = screen.getByRole('button', { name: /Disabled Action/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders loading state when isLoading is true', () => {
      render(<Button isLoading>Confirming</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });
  });

  describe('ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Healthy Child Component</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Healthy Child Component')).toBeInTheDocument();
    });

    it('renders fallback error message when child throws error', () => {
      // Suppress console.error in test runner for thrown error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const BrokenComponent = () => {
        throw new Error('Test crash');
      };

      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected interface issue/i)).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  describe('NotFound', () => {
    it('renders 404 header and description', () => {
      render(<NotFound />);
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('calls onBackHome callback when return button is clicked', () => {
      const handleHome = vi.fn();
      render(<NotFound onBackHome={handleHome} />);
      const btn = screen.getByRole('button', { name: /Return to Homepage/i });
      fireEvent.click(btn);
      expect(handleHome).toHaveBeenCalledTimes(1);
    });
  });
});
