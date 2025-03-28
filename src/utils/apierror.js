class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}
// jab bhi apierror hoga khin bss iss class ko class kr denge with paramters pass krte hue to yeh class uss 
// paramters ko set kr dega aur woh throw kr dega 

/// The built-in JavaScript Error class contains basic error properties like:
// 1️⃣ message → A description of the error
// 2️⃣ stack → The error's stack trace (helps with debugging)
// 3️⃣ name → The name of the error (Error by default, or a subclass like ApiError)