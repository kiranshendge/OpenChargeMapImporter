const formatResponse = (statusCode: number, message: string, data: any) => {
    if (data) {
        return {
            statusCode,
            body: JSON.stringify({
                message,
                data
            })
        }
    } else {
        return {
            statusCode,
            body: JSON.stringify({
                message
            })
        }
    }
}

export const SuccessResponse = (data: any) => {
    return formatResponse(200, 'success', data);
}

export const ErrorResponse = (code = 1000, error: any) => {
    if(Array.isArray(error)) {
        const errorObject = error[0].constraints;
        const errorMessage = errorObject[Object.keys(errorObject)[0]] || 'Error occured';
        return formatResponse(code, errorMessage, errorMessage)
    } else {
        return formatResponse(code, `${error}`, error);
    }
}