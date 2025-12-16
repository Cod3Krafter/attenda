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
        this.validateEvent()
    }

    private validateEvent() {
        if (!this.title || this.title.trim().length === 0) throw new Error('Event Title Required')
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