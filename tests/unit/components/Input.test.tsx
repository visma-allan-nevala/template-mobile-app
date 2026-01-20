import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@components/ui/Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />);
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(<Input label="Email" placeholder="Enter email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');
    expect(onChangeText).toHaveBeenCalledWith('new text');
  });

  it('displays error message', () => {
    const { getByText } = render(<Input placeholder="Email" error="Email is required" />);
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('displays helper text when no error', () => {
    const { getByText } = render(
      <Input placeholder="Password" helperText="At least 8 characters" />
    );
    expect(getByText('At least 8 characters')).toBeTruthy();
  });

  it('shows error instead of helper text when both provided', () => {
    const { getByText, queryByText } = render(
      <Input
        placeholder="Password"
        helperText="At least 8 characters"
        error="Password is too short"
      />
    );
    expect(getByText('Password is too short')).toBeTruthy();
    expect(queryByText('At least 8 characters')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Disabled" disabled onChangeText={onChangeText} />
    );
    const input = getByPlaceholderText('Disabled');
    expect(input.props.editable).toBe(false);
  });
});
