class ApiResponse {
    constructor(statusCode, data , message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400;
        this.sucess = this.success;
    }
}

export { ApiResponse };

// again just makes things easier