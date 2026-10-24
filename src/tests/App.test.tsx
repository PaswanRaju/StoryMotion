import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../components/home/HomePage';
import { App } from '../app/App';
import { SessionProvider } from '../app/SessionContext';

describe('App shell + routing smoke test', () => {
  it('renders the Home screen content at the root route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [{ index: true, element: <HomePage /> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'StoryMotion' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'StoryMotion home' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Adventure' }),
    ).toBeInTheDocument();
  });
});
