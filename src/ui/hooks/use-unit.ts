import { appService } from "../../services/AppService";
import { useEffect, useState } from "react";
import { Unit } from "../../types/models";

export const useUnitsByBookId = (bookId: string) => {
    const [data, setData] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!bookId) {
                setData([]);
                setIsLoading(false);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const units = await appService.getUnitsByBookId(bookId);
                if (!cancelled) {
                    setData(units);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load units");
                    setData([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [bookId]);

    return {
        data,
        isLoading,
        error,
    };
};