import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press</Button>);
    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPress} loading testID="loading-button">
        Submit
      </Button>
    );
    fireEvent.press(getByTestId('loading-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = render(<Button variant="primary">Primary</Button>);
    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(getByText('Secondary')).toBeTruthy();

    rerender(<Button variant="outline">Outline</Button>);
    expect(getByText('Outline')).toBeTruthy();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { rerender, getByText } = render(<Button size="sm">Small</Button>);
    expect(getByText('Small')).toBeTruthy();

    rerender(<Button size="md">Medium</Button>);
    expect(getByText('Medium')).toBeTruthy();

    rerender(<Button size="lg">Large</Button>);
    expect(getByText('Large')).toBeTruthy();
  });
});
