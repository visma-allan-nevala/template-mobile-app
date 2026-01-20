import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '@components/ui/Text';

describe('Text', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = render(<Text variant="title">Title</Text>);
    expect(getByText('Title')).toBeTruthy();

    rerender(<Text variant="subtitle">Subtitle</Text>);
    expect(getByText('Subtitle')).toBeTruthy();

    rerender(<Text variant="body">Body</Text>);
    expect(getByText('Body')).toBeTruthy();

    rerender(<Text variant="caption">Caption</Text>);
    expect(getByText('Caption')).toBeTruthy();

    rerender(<Text variant="label">Label</Text>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('renders with different colors', () => {
    const { rerender, getByText } = render(<Text color="primary">Primary</Text>);
    expect(getByText('Primary')).toBeTruthy();

    rerender(<Text color="secondary">Secondary</Text>);
    expect(getByText('Secondary')).toBeTruthy();

    rerender(<Text color="error">Error</Text>);
    expect(getByText('Error')).toBeTruthy();

    rerender(<Text color="success">Success</Text>);
    expect(getByText('Success')).toBeTruthy();
  });

  it('applies bold style', () => {
    const { getByText } = render(<Text bold>Bold Text</Text>);
    expect(getByText('Bold Text')).toBeTruthy();
  });

  it('applies center alignment', () => {
    const { getByText } = render(<Text center>Centered</Text>);
    expect(getByText('Centered')).toBeTruthy();
  });
});
