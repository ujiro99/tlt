import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type ErrorFallbackProp = {
  error: Error
}

function Fallback(prop: ErrorFallbackProp): JSX.Element {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{prop.error.message}</pre>
    </div>
  )
}

type Props = {
  children: React.ReactElement | React.ReactElement[]
}

export function ErrorFallback(props: Props): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>{props.children}</ErrorBoundary>
  )
}
