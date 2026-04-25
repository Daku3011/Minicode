import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProblemCard from '../src/components/ProblemCard'

describe('ProblemCard', () => {
    it('renders problem details correctly', () => {
        const problem = {
            id: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            points: 100,
            level: 1,
            description: 'Find two numbers that add up to a target'
        }
        
        render(<ProblemCard problem={problem} />)
        
        expect(screen.getByText('Two Sum')).toBeInTheDocument()
        expect(screen.getByText('Easy')).toBeInTheDocument()
        expect(screen.getByText(/100 Points/)).toBeInTheDocument()
        expect(screen.getByText('Find two numbers that add up to a target')).toBeInTheDocument()
    })

    it('uses default description if none provided', () => {
        const problem = {
            id: 2,
            title: 'Reverse String',
            difficulty: 'Medium',
            level: 2,
            points: 200
        }
        
        render(<ProblemCard problem={problem} />)
        
        expect(screen.getByText('Reverse String')).toBeInTheDocument()
        expect(screen.getByText(/Build a highly optimized solution for Reverse String/)).toBeInTheDocument()
    })
})

