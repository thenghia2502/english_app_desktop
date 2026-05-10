import { Curriculum } from "@/lib/types";
import { appService } from "../../services/AppService";
import { useEffect, useState } from "react";


export const useGetBookByCurriculumId = (curriculumId: string) => {
    const [data, setData] = useState<Curriculum | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!curriculumId) {
                setData(null);
                setIsLoading(false);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const book = await appService.getStudentBookByCurriculumId(curriculumId);
                if (!cancelled) {
                    setData(book);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load books");
                    setData(null);
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
    }, [curriculumId]);

    return {
        data,
        isLoading,
        error,
    };
};