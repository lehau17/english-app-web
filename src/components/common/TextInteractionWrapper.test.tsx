import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TextInteractionWrapper from './TextInteractionWrapper'

const queryClient = new QueryClient()

describe('TextInteractionWrapper', () => {
  it('renders children', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TextInteractionWrapper>
          <div>Hello World</div>
        </TextInteractionWrapper>
      </QueryClientProvider>
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
