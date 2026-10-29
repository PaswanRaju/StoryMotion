import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Panel } from '../../ui';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Top-level safety net so a render crash (e.g. a missing asset the renderer
 * didn't guard, or an unexpected engine state) shows a recoverable screen
 * instead of a blank page during a live demo.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('StoryMotion crashed:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render() {
    if (this.state.error) {
      return (
        <Panel variant="glow" role="alert" className="page-message">
          <h2>Oops, the story got a little tangled.</h2>
          <p>
            Something unexpected happened. You can head back home and try again.
          </p>
          <Button onClick={this.handleReset}>Back to Home</Button>
        </Panel>
      );
    }

    return this.props.children;
  }
}
