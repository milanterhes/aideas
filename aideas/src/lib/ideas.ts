import { Result } from "neverthrow";
import { z } from "zod";

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

export interface IdeaService {
    addRawIdeas: (rawIdeas: string) => Promise<void> // Return the number of ideas saved or null if the ideas are invalid
    getIdeas: () => Promise<Idea[]>
    setIdeas: (ideas: Idea[]) => Promise<void>
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

    setIdeas = async (ideas: Idea[]) => {
        localStorage.setItem(this.localStorageKey, JSON.stringify({ ideas }))
    }
}