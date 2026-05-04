// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from './field';
import React from 'react';

// ─── Field ───────────────────────────────────────────────────────────────────

describe('Field', () => {
  it('1. Should render with role="group"', () => {
    render(<Field>Content</Field>);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('2. Should render with data-slot="field"', () => {
    const { container } = render(<Field>Content</Field>);
    expect(container.querySelector('[data-slot="field"]')).toBeInTheDocument();
  });

  it('3. Should default to vertical orientation', () => {
    const { container } = render(<Field>Content</Field>);
    expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
  });

  it('4. Should apply horizontal orientation', () => {
    const { container } = render(<Field orientation="horizontal">Content</Field>);
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument();
  });

  it('5. Should apply responsive orientation', () => {
    const { container } = render(<Field orientation="responsive">Content</Field>);
    expect(container.querySelector('[data-orientation="responsive"]')).toBeInTheDocument();
  });

  it('6. Should merge custom className', () => {
    const { container } = render(<Field className="my-field">Content</Field>);
    expect(container.querySelector('.my-field')).toBeInTheDocument();
  });
});

// ─── FieldLabel ───────────────────────────────────────────────────────────────

describe('FieldLabel', () => {
  it('7. Should render with data-slot="field-label"', () => {
    const { container } = render(<FieldLabel>Label</FieldLabel>);
    expect(container.querySelector('[data-slot="field-label"]')).toBeInTheDocument();
  });

  it('8. Should render children text', () => {
    render(<FieldLabel>Room Name</FieldLabel>);
    expect(screen.getByText('Room Name')).toBeInTheDocument();
  });
});

// ─── FieldTitle ───────────────────────────────────────────────────────────────

describe('FieldTitle', () => {
  it('9. Should render with data-slot="field-label"', () => {
    const { container } = render(<FieldTitle>Title</FieldTitle>);
    expect(container.querySelector('[data-slot="field-label"]')).toBeInTheDocument();
  });

  it('10. Should render title text', () => {
    render(<FieldTitle>Booking Information</FieldTitle>);
    expect(screen.getByText('Booking Information')).toBeInTheDocument();
  });
});

// ─── FieldDescription ────────────────────────────────────────────────────────

describe('FieldDescription', () => {
  it('11. Should render with data-slot="field-description"', () => {
    const { container } = render(<FieldDescription>Hint text</FieldDescription>);
    expect(container.querySelector('[data-slot="field-description"]')).toBeInTheDocument();
  });

  it('12. Should render description text', () => {
    render(<FieldDescription>Enter a valid date</FieldDescription>);
    expect(screen.getByText('Enter a valid date')).toBeInTheDocument();
  });
});

// ─── FieldError ───────────────────────────────────────────────────────────────

describe('FieldError', () => {
  it('13. Should render nothing when no children and no errors', () => {
    const { container } = render(<FieldError />);
    expect(container.firstChild).toBeNull();
  });

  it('14. Should render children text when provided', () => {
    render(<FieldError>This field is required</FieldError>);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('15. Should render role="alert" when content exists', () => {
    render(<FieldError>Error!</FieldError>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('16. Should render single error message from errors array', () => {
    render(<FieldError errors={[{ message: 'Name is required' }]} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('17. Should render multiple error messages as a list', () => {
    render(
      <FieldError
        errors={[
          { message: 'Name is required' },
          { message: 'Name must be at least 3 chars' },
        ]}
      />
    );
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Name must be at least 3 chars')).toBeInTheDocument();
  });

  it('18. Should deduplicate identical error messages', () => {
    render(
      <FieldError
        errors={[
          { message: 'Required' },
          { message: 'Required' },
        ]}
      />
    );
    // Deduplicated — should appear only once
    expect(screen.getAllByText('Required')).toHaveLength(1);
  });

  it('19. Should render nothing when errors array is empty', () => {
    const { container } = render(<FieldError errors={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

// ─── FieldGroup ───────────────────────────────────────────────────────────────

describe('FieldGroup', () => {
  it('20. Should render with data-slot="field-group"', () => {
    const { container } = render(<FieldGroup>Group</FieldGroup>);
    expect(container.querySelector('[data-slot="field-group"]')).toBeInTheDocument();
  });

  it('21. Should render children', () => {
    render(<FieldGroup>Group Content</FieldGroup>);
    expect(screen.getByText('Group Content')).toBeInTheDocument();
  });
});

// ─── FieldLegend ─────────────────────────────────────────────────────────────

describe('FieldLegend', () => {
  it('22. Should render with data-slot="field-legend"', () => {
    const { container } = render(
      <fieldset>
        <FieldLegend>Legend</FieldLegend>
      </fieldset>
    );
    expect(container.querySelector('[data-slot="field-legend"]')).toBeInTheDocument();
  });

  it('23. Should render legend text', () => {
    render(
      <fieldset>
        <FieldLegend>Personal Information</FieldLegend>
      </fieldset>
    );
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('24. Should apply label variant', () => {
    const { container } = render(
      <fieldset>
        <FieldLegend variant="label">Label Style</FieldLegend>
      </fieldset>
    );
    expect(container.querySelector('[data-variant="label"]')).toBeInTheDocument();
  });
});

// ─── FieldSeparator ───────────────────────────────────────────────────────────

describe('FieldSeparator', () => {
  it('25. Should render with data-slot="field-separator"', () => {
    const { container } = render(<FieldSeparator />);
    expect(container.querySelector('[data-slot="field-separator"]')).toBeInTheDocument();
  });

  it('26. Should render with data-content=false when no children', () => {
    const { container } = render(<FieldSeparator />);
    expect(container.querySelector('[data-content="false"]')).toBeInTheDocument();
  });

  it('27. Should render with data-content=true when children provided', () => {
    const { container } = render(<FieldSeparator>OR</FieldSeparator>);
    expect(container.querySelector('[data-content="true"]')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});

// ─── FieldSet ─────────────────────────────────────────────────────────────────

describe('FieldSet', () => {
  it('28. Should render with data-slot="field-set"', () => {
    const { container } = render(<FieldSet>Set</FieldSet>);
    expect(container.querySelector('[data-slot="field-set"]')).toBeInTheDocument();
  });

  it('29. Should render children', () => {
    render(<FieldSet>Set Content</FieldSet>);
    expect(screen.getByText('Set Content')).toBeInTheDocument();
  });
});

// ─── FieldContent ─────────────────────────────────────────────────────────────

describe('FieldContent', () => {
  it('30. Should render with data-slot="field-content"', () => {
    const { container } = render(<FieldContent>Content</FieldContent>);
    expect(container.querySelector('[data-slot="field-content"]')).toBeInTheDocument();
  });

  it('31. Should render children', () => {
    render(<FieldContent>Field Content</FieldContent>);
    expect(screen.getByText('Field Content')).toBeInTheDocument();
  });
});

// ─── Composition ─────────────────────────────────────────────────────────────

describe('Field composition', () => {
  it('32. Should render a complete Field with Label, Description, and Error', () => {
    render(
      <Field>
        <FieldLabel>Room Name</FieldLabel>
        <FieldContent>
          <FieldDescription>Enter the conference room name</FieldDescription>
          <FieldError>Room name is required</FieldError>
        </FieldContent>
      </Field>
    );
    expect(screen.getByText('Room Name')).toBeInTheDocument();
    expect(screen.getByText('Enter the conference room name')).toBeInTheDocument();
    expect(screen.getByText('Room name is required')).toBeInTheDocument();
  });
});
