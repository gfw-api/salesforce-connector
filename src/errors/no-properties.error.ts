export default class NoPropertiesError extends Error {
    private status: number;

    constructor() {
        super('No properties to update');
        this.status = 400;
    }

}
