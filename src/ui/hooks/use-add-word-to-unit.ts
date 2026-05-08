import { useState } from "react"
import { appService } from "../../services/AppService"

interface AddWordPayload {
    wordIds: string[]
    unitId: string
}

interface AddWordOptions {
    onSuccess?: () => void | Promise<void>
}

interface UseAddWordToUnitReturn {
    isLoading: boolean
    error: string | null
    addWordToUnit: (payload: AddWordPayload, options?: AddWordOptions) => Promise<boolean>
}

export const useAddWordToUnit = (): UseAddWordToUnitReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const addWordToUnit = async (payload: AddWordPayload, options?: AddWordOptions): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await appService.addWordsToUnit(payload.unitId, payload.wordIds)

            if (options?.onSuccess) {
                await options.onSuccess()
            }

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error("Error adding word to unit:", err)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        addWordToUnit
    }
}
