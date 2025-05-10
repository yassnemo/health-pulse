import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Card, Alert, Badge, Pagination } from '../../../components/ui/UIComponents';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('bg-primary-600');
  });

  test('renders correctly with variant prop', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Secondary Button/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('bg-secondary-600');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Clickable Button/i });
    
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
    
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('opacity-50');
  });
});

describe('Card Component', () => {
  test('renders correctly with children', () => {
    render(<Card>Card Content</Card>);
    const cardElement = screen.getByText(/Card Content/i);
    expect(cardElement).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Card className="custom-class">Card Content</Card>);
    const cardElement = screen.getByText(/Card Content/i).closest('div');
    expect(cardElement).toHaveClass('custom-class');
  });
});

describe('Alert Component', () => {
  test('renders correctly with default props', () => {
    render(<Alert>Alert Message</Alert>);
    const alertElement = screen.getByText(/Alert Message/i);
    expect(alertElement).toBeInTheDocument();
    expect(alertElement.closest('div')).toHaveClass('bg-blue-100');
  });

  test('renders correctly with type prop', () => {
    render(<Alert type="error">Error Message</Alert>);
    const alertElement = screen.getByText(/Error Message/i);
    expect(alertElement).toBeInTheDocument();
    expect(alertElement.closest('div')).toHaveClass('bg-red-100');
  });

  test('renders dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible Alert</Alert>);
    const dismissButton = screen.getByRole('button');
    expect(dismissButton).toBeInTheDocument();
  });

  test('calls onDismiss handler when dismiss button clicked', () => {
    const handleDismiss = jest.fn();
    render(<Alert dismissible onDismiss={handleDismiss}>Dismissible Alert</Alert>);
    const dismissButton = screen.getByRole('button');
    
    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Badge Component', () => {
  test('renders correctly with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badgeElement = screen.getByText(/Default Badge/i);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-gray-100');
  });

  test('renders correctly with color prop', () => {
    render(<Badge color="red">Red Badge</Badge>);
    const badgeElement = screen.getByText(/Red Badge/i);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-red-100');
  });
});

describe('Pagination Component', () => {
  test('renders correctly with default props', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    const paginationElement = screen.getByRole('navigation');
    expect(paginationElement).toBeInTheDocument();
  });

  test('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();
  });

  test('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  test('calls onPageChange when clicking page number', () => {
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />);
    
    const pageButton = screen.getByText('2');
    fireEvent.click(pageButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
