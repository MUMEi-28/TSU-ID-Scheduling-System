import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminPage from './AdminPage';

// Mock props
const mockProps = {
  handleLogout: jest.fn(),
};

describe('AdminPage', () => {
  it('renders search bar and table', () => {
    render(<AdminPage {...mockProps} />);
    expect(screen.getByPlaceholderText(/search by name or student number/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
}); 