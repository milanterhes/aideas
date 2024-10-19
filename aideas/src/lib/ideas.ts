import { Result } from "neverthrow";
import { z } from "zod";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

export const IdeaSchema = z.object({
    idea: z.string(),
    context: z.string(),
});

export type Idea = z.infer<typeof IdeaSchema>;

class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

const formatParseError = (e: unknown) => {
    if (e instanceof z.ZodError) {
        return new ParseError(e.errors.map(err => err.message).join(', '))
    }

    if (e instanceof Error) {
        return new ParseError(e.message)
    }

    return new ParseError('Unknown error')
}

export const parseIdeas = Result.fromThrowable((ideas: string) => z.array(IdeaSchema).parse(JSON.parse(ideas).ideas), formatParseError)

class ApiError extends Error {
    constructor(message: string) {
        super(message)
    }
}

const formatApiError = (e: unknown) => {
    if (e instanceof Error) {
        return new ApiError(e.message)
    }

    return new ApiError('Unknown error')
}

export const getIdeasFromApi = async () => {
    return ResultAsync.fromPromise(
        fetch("/api/ideas"),
        formatApiError
    ).andThen((response) =>
        ResultAsync.fromPromise(
            response.json(),
            (error) => new Error(`Failed to parse response: ${error}`)
        )
    ).andThen((ideas) => {
        const result = z.array(IdeaSchema).safeParse(ideas);
        if (result.success) {
            return okAsync(result.data);
        } else {
            return errAsync(new ApiError(result.error.errors.join(", ")));
        }
    })
}

export const addIdeaToApi = async (ideas: Idea[]) => {
    return ResultAsync.fromPromise(
        fetch("/api/ideas", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ideas),
        }),
        formatApiError
    ).andThen((response) => {
        if (response.ok) {
            return okAsync(null);
        } else {
            return errAsync(new ApiError(`Failed to add idea: ${response.statusText}`));
        }
    })
}

export const resetIdeasInApi = async () => {
    return ResultAsync.fromPromise(
        fetch("/api/ideas", {
            method: 'DELETE',
        }),
        formatApiError
    ).andThen((response) => {
        if (response.ok) {
            return okAsync(null);
        } else {
            return errAsync(new ApiError(`Failed to reset ideas: ${response.statusText}`));
        }
    })
}

export interface IdeaService {
    addRawIdeas: (rawIdeas: string) => Promise<void> // Return the number of ideas saved or null if the ideas are invalid
    getIdeas: () => Promise<Idea[]>
    resetIdeas: () => Promise<void>
}

export class LocalIdeaService implements IdeaService {
    private localStorageKey = 'ideas';
    /**
     * Get the ideas from local storage. If the ideas are not valid, remove them from local storage.
     */
    getIdeas = async () => {
        const ideas = localStorage.getItem(this.localStorageKey)
        if (ideas) {
            const parseResult = parseIdeas(ideas)
            if (parseResult.isOk()) {
                return parseResult.value
            }
            if (parseResult.isErr()) {
                localStorage.removeItem(this.localStorageKey)
            }
        }
        return []
    }

    addRawIdeas = async (rawIdeas: string) => {
        const ideas = await this.getIdeas()
        const parsed = parseIdeas(rawIdeas)
        if (parsed.isOk()) {
            const updatedIdeas = [...ideas, ...parsed.value]
            localStorage.setItem(this.localStorageKey, JSON.stringify({ ideas: updatedIdeas }))
        } else {
            throw new Error('Invalid ideas')
        }
    }

    resetIdeas = async () => {
        localStorage.setItem(this.localStorageKey, JSON.stringify({ ideas: [] }))
    }
}

export class RemoteIdeaService implements IdeaService {
    getIdeas = async () => {
        const response = await getIdeasFromApi()
        if (response.isOk()) {
            return response.value
        }
        return []
    }

    addRawIdeas = async (rawIdeas: string) => {
        const parsed = parseIdeas(rawIdeas)
        if (parsed.isOk()) {
            const result = await addIdeaToApi(parsed.value)
            if (result.isErr()) {
                throw result.error
            }
        } else {
            throw new Error('Invalid ideas')
        }
    }

    resetIdeas = async () => {
        const result = await resetIdeasInApi()
        if (result.isErr()) {
            throw result.error
        }
    }
}