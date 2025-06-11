// components/ErrorBoundary.tsx
import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error Boundary Caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>
        <h1>Something went wrong.</h1>
        <p>Please try again later.</p>
        <p>If the problem persists, contact support.</p>
        <p></p>
        <p>We apologize for the inconvenience.</p>
      </div>
    }
    return this.props.children;
  }
}

export default ErrorBoundary;