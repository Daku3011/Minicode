import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProblemCard from '../src/components/ProblemCard'

describe('ProblemCard', () => {
    it('renders problem details correctly', () => {
        const problem = {
            id: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            xp_reward: 100,
            level: 1,
            description: 'Find two numbers that add up to a target'
        }
        
        render(<ProblemCard problem={problem} />)
        
        expect(screen.getByText('Two Sum')).toBeInTheDocument()
        expect(screen.getByText('Easy')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('XP')).toBeInTheDocument()
        expect(screen.getByText('Find two numbers that add up to a target')).toBeInTheDocument()
    })

    it('uses default description if none provided', () => {
        const problem = {
            id: 2,
            title: 'Reverse String',
            difficulty: 'Medium',
            level: 2,
            xp_reward: 200
        }
        
        render(<ProblemCard problem={problem} />)
        
        expect(screen.getByText('Reverse String')).toBeInTheDocument()
        expect(screen.getByText(/Solve Reverse String with an efficient approach/)).toBeInTheDocument()
    })
})

