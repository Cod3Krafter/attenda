// Guests can
// Rsvp
// Check in
// Check out

export class Guest{
    constructor(
        readonly id: string,
        readonly eventId: string,
        public name: string,
        public email: string,
        public phone: string,
        public rsvpStatus: 'yes' | 'no' | 'pending' = 'pending',
        public checkedIn: boolean,
        public checkedOut: boolean,
        public rsvpAt?: Date,
        public qrCode?: string,
        public checkedInAt?: Date,
        public checkedOutAt?: Date,
        public createdAt: Date = new Date(),
        public updatedAt?: Date
    ) {

        // validate the nely created user
        this.validate()
    }

    //  Validate function
    private validate() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Guest name is required');
        }
        if (!this.isValidEmail(this.email)) {
            throw new Error('Invalid email format');
        }
    }

    // Checks if email is valid via regex
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

      // user action: respond yes/no
    updateRSVP(status: 'yes' | 'no') {
        if (status !== 'yes' && status !== 'no') throw new Error('Invalid RSVP');
        this.rsvpStatus = status;
        this.rsvpAt = new Date();
    }

    checkIn() {
        if (this.checkedIn) throw new Error('Guest already checked in');
        this.checkedIn = true;
        this.checkedInAt = new Date();
    }

    checkOut(){
        // Must be checked in
        if(!this.checkedIn) throw new Error ("Guest not checked in yet")
        
        // Must not be alreadt checked out
        if (this.checkedOut) throw new Error ("Guest already checked out")
            
        this.checkedIn = false;
        this.checkedOutAt = new Date();
    }

}