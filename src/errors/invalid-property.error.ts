export default class InvalidPropertyError extends Error {
    private status: number;

    constructor(msg:string) {
        super(msg);
        this.message = msg;
        this.status = 400;
    }

}
