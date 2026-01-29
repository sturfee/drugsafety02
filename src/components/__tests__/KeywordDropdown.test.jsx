import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KeywordDropdown from '../../components/KeywordDropdown'

describe('KeywordDropdown', () => {
    const mockKeywords = [
        { keyword: 'All', count: 100 },
        { keyword: 'Ozempic', count: 50 },
        { keyword: 'Wegovy', count: 30 }
    ]
    const mockOnSelect = vi.fn()

    it('renders correctly with keywords', () => {
        // Render without crashing
        render(<KeywordDropdown keywords={mockKeywords} selectedKeyword="All" onKeywordChange={mockOnSelect} />)

        // Check if dropdown exists
        const select = screen.getByRole('combobox')
        expect(select).toBeInTheDocument()

        // Check options using regex to handle whitespace
        expect(screen.getByText(/All\s*\(\s*100\s*\)/)).toBeInTheDocument()
        expect(screen.getByText(/Ozempic\s*\(\s*50\s*\)/)).toBeInTheDocument()
    })

    it('calls onKeywordChange when changed', () => {
        render(<KeywordDropdown keywords={mockKeywords} selectedKeyword="All" onKeywordChange={mockOnSelect} />)

        const select = screen.getByRole('combobox')

        // Simulate selection
        fireEvent.change(select, { target: { value: 'Ozempic' } })

        expect(mockOnSelect).toHaveBeenCalledWith('Ozempic')
    })
})
