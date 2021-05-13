export default class ContactNotFoundError extends Error {
    private status: number;

    constructor() {
        super('Contact not found');
        this.message = 'Contact not found';
        this.status = 404;
    }

}
