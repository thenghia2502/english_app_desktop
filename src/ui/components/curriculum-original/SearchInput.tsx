"use client"

import React from 'react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    placeholder?: string
    className?: string
}

export default function SearchInput({ 
    searchTerm, 
    onSearchChange, 
    placeholder = "Tìm kiếm...",
    className = ""
}: SearchInputProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        onSearchChange(value)
    }

    return (
        <div className={`text-gray-900 flex items-center gap-4 mb-4 ${className}`}>
            <span>Tìm kiếm:</span>
            <Input 
                placeholder={placeholder}
                className="w-full max-w-md" 
                value={searchTerm}
                onChange={handleInputChange}
            />
        </div>
    )
}