import { sanitizeText, sanitizeHtml, isValidLength } from '../../../lib/sanitize';

export class Event {
    constructor(
        readonly id : string,
        public title : string,
        public description : string | null,
        readonly organizerId : string,
        public venue : string,
        public endDate: Date,
        public startDate?: Date,
        public status : 'draft' | 'published' | 'cancelled' | 'completed' = 'draft',
        public publishedAt?: Date,
        public createdAt : Date =  new Date(),
        public updatedAt?: Date
    )
    {
        // Sanitize inputs
        this.title = sanitizeText(title);
        this.description = description ? sanitizeHtml(description) : null;
        this.venue = sanitizeText(venue);

        this.validateEvent()
    }

    private validateEvent() {
        if (!this.title || this.title.trim().length === 0) throw new Error('Event Title Required');
        if (!isValidLength(this.title, 1, 200)) throw new Error('Event title must be between 1 and 200 characters');
        if (this.description && !isValidLength(this.description, 0, 5000)) throw new Error('Event description must be less than 5000 characters');
        if (!isValidLength(this.venue, 1, 300)) throw new Error('Event venue must be between 1 and 300 characters');
    }

      publishEvent() {
        if (this.status === 'published') throw new Error('Already Published');
        if (!this.venue) throw new Error('Missing venue');
        if (!this.startDate || !this.endDate) throw new Error ("Missing start date")
        this.status = 'published';
        this.publishedAt = new Date();
    }

        cancelEvent(reason?: string) {
        if (this.status === 'cancelled') throw new Error('Already Cancelled');
        this.status = 'cancelled';
        this.updatedAt = new Date();
        // optionally store reason in an audit log (outside aggregate)
    }

        updateDetails(details: {
        title?: string; description?: string | null; startDate?: Date; endDate?: Date; venue?: string;
    }) {
        if (details.title) this.title = details.title;
        if (details.description !== undefined) this.description = details.description;
        if (details.startDate) this.startDate = details.startDate;
        if (details.endDate) this.endDate = details.endDate;
        if (details.venue) this.venue = details.venue;
        this.updatedAt = new Date();
    }
}