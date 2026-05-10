import { useState } from "react"
import { appService } from "../../services/AppService"

interface CheckWordPayload {
    unitId: string
    wordId: string
}

interface CheckWordOptions<T> {
    onSuccess?: (data: T) => void | Promise<void>
}

interface UseCheckWordInUnitReturn<T> {
    isChecking: boolean
    error: string | null
    result: T | null
    checkWordInUnit: (payload: CheckWordPayload, options?: CheckWordOptions<T>) => Promise<T | null>
}

export function useCheckWordInUnit<T = unknown>(): UseCheckWordInUnitReturn<T> {
    const [isChecking, setIsChecking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<T | null>(null)

    const checkWordInUnit = async (payload: CheckWordPayload, options?: CheckWordOptions<T>): Promise<T | null> => {
        setIsChecking(true)
        setError(null)

        try {
            const data = await appService.checkWordToUnit(payload.unitId, payload.wordId) as unknown as T

            setResult(data)
            if (options?.onSuccess) {
                await options.onSuccess(data)
            }

            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Error checking word in unit:', err)
            return null
        } finally {
            setIsChecking(false)
        }
    }

    return {
        isChecking,
        error,
        result,
        checkWordInUnit
    }
}
